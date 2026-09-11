import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_NAME = 'engineering-doctrine';
const POLICY_AGENT = `${PLUGIN_NAME}:doctrine-policy-verifier`;
const POLICY_PROTOCOL = 1;
const STATE_PROTOCOL = 5;
const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const sourceTreePluginRoot = path.resolve(runtimeDir, '..', 'plugin');
const pluginRoot = fs.existsSync(sourceTreePluginRoot) ? sourceTreePluginRoot : path.resolve(runtimeDir, '..');
const projectionMapPath = path.join(pluginRoot, 'doctrine', 'projection-map.json');

const WRITE_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit']);
const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
const AGENT_TOOLS = new Set(['Agent']);
const INSPECTION_TOOLS = new Set(['Read', 'Grep', 'Glob', 'Bash', 'PowerShell']);
const TRACKABLE_VERIFICATION_KINDS = new Set(['test', 'lint', 'typecheck', 'build', 'static-analysis']);
const READ_ONLY_GIT = new Set([
  'status', 'log', 'show', 'grep', 'rev-parse', 'ls-files', 'diff', 'branch',
  'cat-file', 'ls-tree', 'merge-base', 'name-rev', 'describe', 'remote', 'config',
]);
const DELIVERY_PREAMBLE = 'Base directory for this skill';
const LOCK_WAIT_MS = 3500;
const LOCK_STALE_MS = 15000;
const MAX_ADVISORIES = 100;
const sleepCell = new Int32Array(new SharedArrayBuffer(4));

const DOC_BASENAMES = new Set([
  'readme', 'contributing', 'changelog', 'claude.md', 'agents.md',
  'license', 'license.md', 'security.md', 'code_of_conduct.md',
]);
const DOC_EXTENSIONS = new Set(['.md', '.mdx', '.rst', '.adoc']);
const DEPENDENCY_BASENAMES = new Set([
  'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
  'bun.lock', 'bun.lockb', 'cargo.toml', 'cargo.lock', 'pyproject.toml',
  'poetry.lock', 'pdm.lock', 'uv.lock', 'requirements.txt',
  'requirements-dev.txt', 'go.mod', 'go.sum', 'gemfile', 'gemfile.lock',
  'composer.json', 'composer.lock', 'pom.xml', 'build.gradle',
  'build.gradle.kts', 'gradle.lockfile',
]);
const GIT_WORKTREE_MUTATIONS = new Set([
  'apply', 'am', 'checkout', 'switch', 'merge', 'rebase', 'reset', 'restore',
  'stash', 'cherry-pick', 'revert', 'pull', 'init', 'clone', 'clean', 'rm', 'mv', 'worktree',
]);
const GIT_METADATA_ONLY = new Set(['add', 'commit', 'branch', 'tag', 'push']);

const FAILURE_CHECKPOINT = toolName =>
  `Engineering Doctrine: ${toolName || 'tool'} failed. Treat failure as evidence. Reassess the next action instead of repeating or bypassing the failed path; load any newly applicable doctrine skill before retrying.`;

function readStdinJson() {
  const raw = fs.readFileSync(0, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function emit(event, additionalContext, extra = {}) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: { hookEventName: event, additionalContext, ...extra },
  })}\n`);
}

function emitStatic(name) {
  process.stdout.write(fs.readFileSync(path.join(runtimeDir, `${name}.json`), 'utf8'));
}

function staticAdditionalContext(name) {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(runtimeDir, `${name}.json`), 'utf8'));
    return String(parsed?.hookSpecificOutput?.additionalContext || '');
  } catch {
    return '';
  }
}

function loadManifest() {
  const manifest = JSON.parse(fs.readFileSync(projectionMapPath, 'utf8'));
  const names = Object.keys(manifest.skills || {});
  if (!names.length) throw new Error('projection map has no skill catalog');

  const summaries = new Map();
  for (const name of names) {
    const summary = manifest.skills[name]?.discoverySummary;
    if (typeof summary !== 'string' || !summary.trim()) {
      throw new Error(`skill ${name} has no discovery summary`);
    }
    summaries.set(name, summary.trim());
  }
  return { names, summaries };
}

function safeId(value) {
  return String(value || 'unknown').replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 160);
}

function stateBaseDir() {
  const explicit = process.env.ENGINEERING_DOCTRINE_STATE_DIR;
  if (explicit) return explicit;
  const pluginData = process.env.CLAUDE_PLUGIN_DATA;
  if (pluginData) return path.join(pluginData, 'policy-state');
  return path.join(os.tmpdir(), 'engineering-doctrine-policy-state');
}

function sessionDir(sessionId) {
  return path.join(stateBaseDir(), safeId(sessionId));
}

function pointerPath(sessionId) {
  return path.join(sessionDir(sessionId), 'latest.json');
}

function statePath(sessionId, promptId) {
  return path.join(sessionDir(sessionId), `${safeId(promptId)}.json`);
}

function lockPath(sessionId) {
  return path.join(sessionDir(sessionId), '.state.lock');
}

function atomicWriteJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, filePath);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function sleep(ms) {
  Atomics.wait(sleepCell, 0, 0, ms);
}

function acquireSessionLock(sessionId) {
  const filePath = lockPath(sessionId);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const started = Date.now();

  while (Date.now() - started < LOCK_WAIT_MS) {
    try {
      const fd = fs.openSync(filePath, 'wx');
      fs.writeFileSync(fd, `${process.pid} ${Date.now()}\n`, 'utf8');
      return { fd, filePath };
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      try {
        const age = Date.now() - fs.statSync(filePath).mtimeMs;
        if (age > LOCK_STALE_MS) {
          fs.unlinkSync(filePath);
          continue;
        }
      } catch (statError) {
        if (statError?.code !== 'ENOENT') throw statError;
        continue;
      }
      sleep(20);
    }
  }
  throw new Error(`policy state lock timed out for session ${safeId(sessionId)}`);
}

function releaseSessionLock(lock) {
  try { fs.closeSync(lock.fd); } catch {}
  try { fs.unlinkSync(lock.filePath); } catch {}
}

function withSessionLock(input, fn) {
  const sessionId = String(input.session_id || 'unknown-session');
  const lock = acquireSessionLock(sessionId);
  try {
    return fn();
  } finally {
    releaseSessionLock(lock);
  }
}

function promptIdentity(input) {
  const sessionId = String(input.session_id || 'unknown-session');
  let promptId = String(input.prompt_id || '');
  if (!promptId) {
    const pointer = readJson(pointerPath(sessionId));
    promptId = String(pointer?.promptId || 'legacy-current');
  }
  return { sessionId, promptId };
}

function defaultState(input) {
  const { sessionId, promptId } = promptIdentity(input);
  return {
    protocolVersion: STATE_PROTOCOL,
    policyProtocol: POLICY_PROTOCOL,
    sessionId,
    promptId,
    cwd: String(input.cwd || ''),
    ownerPrompt: String(input.prompt || ''),
    contextEpoch: 0,
    actors: {},
    mutationCount: 0,
    reviewRevision: 0,
    verificationRevision: 0,
    mutations: [],
    verifications: [],
    failures: [],
    advisories: [],
    preflight: null,
    completion: null,
    verifierSnapshots: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeState(state) {
  if (!state) return state;
  if (!state.actors || typeof state.actors !== 'object') state.actors = {};
  if (!state.verifierSnapshots || typeof state.verifierSnapshots !== 'object') state.verifierSnapshots = {};
  if (!Array.isArray(state.mutations)) state.mutations = [];
  if (!Array.isArray(state.verifications)) state.verifications = [];
  if (!Array.isArray(state.failures)) state.failures = [];
  if (!Array.isArray(state.advisories)) state.advisories = [];
  state.protocolVersion = STATE_PROTOCOL;
  return state;
}

function loadState(input, create = false) {
  const { sessionId, promptId } = promptIdentity(input);
  let state = readJson(statePath(sessionId, promptId));
  if (!state && create) state = defaultState(input);
  return normalizeState(state);
}

function saveState(state) {
  if (!state) return;
  state.updatedAt = new Date().toISOString();
  atomicWriteJson(statePath(state.sessionId, state.promptId), state);
  atomicWriteJson(pointerPath(state.sessionId), { promptId: state.promptId, updatedAt: state.updatedAt });
}

function mutateState(input, fn) {
  return withSessionLock(input, () => {
    const state = loadState(input, true);
    const result = fn(state);
    saveState(state);
    return result;
  });
}

function actorKey(input) {
  const id = String(input.agent_id || '');
  return id ? `agent:${id}` : 'main';
}

function actorState(state, input) {
  const key = actorKey(input);
  if (!state.actors[key]) state.actors[key] = { skills: [], skillEpoch: state.contextEpoch };
  const actor = state.actors[key];
  if (actor.skillEpoch !== state.contextEpoch) {
    actor.skills = [];
    actor.skillEpoch = state.contextEpoch;
  }
  return actor;
}

function stateSkills(state, input) {
  if (!state) return new Set();
  const actor = state.actors?.[actorKey(input)];
  if (!actor || actor.skillEpoch !== state.contextEpoch) return new Set();
  return new Set(actor.skills || []);
}

function transcriptRecords(transcriptPath) {
  if (!transcriptPath) return null;
  let raw;
  try {
    raw = fs.readFileSync(transcriptPath, 'utf8');
  } catch {
    return null;
  }

  const records = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      records.push(JSON.parse(trimmed));
    } catch {
      // A trailing incomplete JSONL line is not evidence.
    }
  }
  return records;
}

function isOwnerPrompt(record) {
  if (!record || record.type !== 'user') return false;
  const content = record.message?.content;
  if (typeof content === 'string') return true;
  if (!Array.isArray(content)) return false;
  return content.some(item => item && item.type !== 'tool_result');
}

function isContextReset(record) {
  if (!record || record.type !== 'attachment') return false;
  const event = record.attachment?.hookEvent;
  return event === 'SessionStart' || event === 'SubagentStart';
}

function activeWindow(records) {
  let start = 0;
  for (let i = 0; i < records.length; i++) {
    if (isOwnerPrompt(records[i]) || isContextReset(records[i])) start = i;
  }
  return records.slice(start);
}

function collectDeliveredText(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) collectDeliveredText(item, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (node.type === 'text' && typeof node.text === 'string') out.push(node.text);
  for (const value of Object.values(node)) collectDeliveredText(value, out);
}

function deliveredSkills(records, summaries) {
  const blocks = [];
  for (const record of records || []) collectDeliveredText(record, blocks);
  const preambles = blocks.filter(text => text.includes(DELIVERY_PREAMBLE));
  const delivered = new Set();

  for (const [name, summary] of summaries) {
    const named = new RegExp(`[\\\\/]${name}(?:[\\\\/\\s]|$)`, 'm');
    if (blocks.some(text => text.includes(summary)) || preambles.some(text => named.test(text))) {
      delivered.add(name);
    }
  }
  return delivered;
}

function activeSkills(input, manifest) {
  const state = loadState(input, false);
  const fromState = stateSkills(state, input);
  const records = transcriptRecords(String(input.transcript_path || ''));
  if (!records) return fromState;
  const delivered = deliveredSkills(activeWindow(records), manifest.summaries);
  return new Set([...fromState, ...delivered]);
}

function toolPath(input) {
  return String(input.file_path ?? input.notebook_path ?? input.path ?? '').replaceAll('\\', '/');
}

function basenameLower(filePath) {
  return path.posix.basename(filePath.toLowerCase());
}

function isDocumentationPath(filePath) {
  if (!filePath) return false;
  const lower = filePath.toLowerCase();
  const base = basenameLower(lower);
  return DOC_BASENAMES.has(base) || DOC_EXTENSIONS.has(path.posix.extname(base)) || /(^|\/)docs?\//.test(lower);
}

function isTestPath(filePath) {
  if (!filePath) return false;
  const lower = filePath.toLowerCase();
  const base = basenameLower(lower);
  return /(^|\/)(test|tests|spec|specs|__tests__)(\/|$)/.test(lower)
    || /(?:^|[._-])(test|spec)(?:[._-]|$)/.test(base)
    || /_(test|spec)\.[a-z0-9]+$/.test(base);
}

function isDependencyPath(filePath) {
  if (!filePath) return false;
  return DEPENDENCY_BASENAMES.has(basenameLower(filePath));
}

function shellCommand(input) {
  return String(input.command ?? input.script ?? input.code ?? '');
}

function hasShellControlSyntax(command) {
  return /[\n\r;&|<>`]|\$\(/.test(command);
}

function splitShellSegments(command) {
  const segments = [];
  let current = '';
  let quote = null;
  let escaped = false;

  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && quote !== "'") {
      current += ch;
      escaped = true;
      continue;
    }
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      current += ch;
      quote = ch;
      continue;
    }
    if (ch === ';' || ch === '&' || ch === '|' || ch === '\n' || ch === '\r') {
      if (current.trim()) segments.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (quote || escaped) return null;
  if (current.trim()) segments.push(current.trim());
  return segments;
}

function shellWords(segment) {
  const words = [];
  let current = '';
  let quote = null;
  let escaped = false;

  const push = () => {
    if (current.length) words.push(current);
    current = '';
  };

  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && quote !== "'") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      push();
      continue;
    }
    current += ch;
  }
  if (quote || escaped) return null;
  push();
  return words;
}

function gitSubcommandFromWords(words) {
  if (!Array.isArray(words) || !words.length) return null;
  const executable = path.basename(words[0]).toLowerCase();
  if (executable !== 'git' && executable !== 'git.exe') return null;

  const valueOptions = new Set([
    '-C', '-c', '--git-dir', '--work-tree', '--namespace', '--super-prefix',
    '--config-env', '--attr-source', '--exec-path',
  ]);
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (word === '--') continue;
    if (!word.startsWith('-')) return word.toLowerCase();

    const option = word.includes('=') ? word.slice(0, word.indexOf('=')) : word;
    if (valueOptions.has(option) && !word.includes('=')) i += 1;
  }
  return null;
}

function gitSubcommands(command) {
  const segments = splitShellSegments(command);
  if (!segments) return [];
  const out = [];
  for (const segment of segments) {
    const subcommand = gitSubcommandFromWords(shellWords(segment));
    if (subcommand) out.push(subcommand);
  }
  return out;
}

function gitMutation(command) {
  const mutating = new Set([
    'add', 'apply', 'am', 'commit', 'checkout', 'switch', 'branch', 'merge', 'rebase',
    'reset', 'restore', 'stash', 'cherry-pick', 'revert', 'tag', 'push', 'pull',
    'init', 'clone', 'clean', 'rm', 'mv', 'worktree',
  ]);
  return gitSubcommands(command).some(subcommand => mutating.has(subcommand));
}

function gitWorkingTreeMutation(command) {
  return gitSubcommands(command).some(subcommand => GIT_WORKTREE_MUTATIONS.has(subcommand));
}

function gitMetadataOnly(command) {
  const subs = gitSubcommands(command);
  if (!subs.length) return false;
  const hasMetadataMutation = subs.some(subcommand => GIT_METADATA_ONLY.has(subcommand));
  return hasMetadataMutation && subs.every(subcommand => GIT_METADATA_ONLY.has(subcommand) || READ_ONLY_GIT.has(subcommand));
}

function dependencyCommand(command) {
  const patterns = [
    /\b(?:npm|pnpm|yarn|bun)\s+(?:add|install|i|update|upgrade|remove|uninstall|ci)\b/i,
    /\b(?:pip|pip3)\s+(?:install|uninstall)\b/i,
    /\bpoetry\s+(?:add|remove|update|install)\b/i,
    /\b(?:uv|pdm)\s+(?:add|remove|sync|lock)\b/i,
    /\bcargo\s+(?:add|remove|update|install)\b/i,
    /\bgo\s+(?:get|mod\s+(?:tidy|vendor|download))\b/i,
    /\bbundle\s+(?:add|update|install)\b/i,
    /\bcomposer\s+(?:require|remove|update|install)\b/i,
  ];
  return patterns.some(pattern => pattern.test(command));
}

function verificationMutationFlag(command) {
  return /(?:^|\s)(?:--write|--fix|--update(?:-snapshots?|Snapshot)?|--bless|-u)(?:\s|$)/i.test(command);
}

function verificationKind(command) {
  const trimmed = command.trim();
  if (!trimmed || hasShellControlSyntax(trimmed) || verificationMutationFlag(trimmed)) return null;
  const rules = [
    ['test', /\bpytest\b|\bpython\s+-m\s+(?:pytest|unittest)\b|\b(?:jest|vitest|mocha|ava)\b|\b(?:npm|pnpm|yarn|bun)\s+(?:test|run\s+test)\b|\bcargo\s+test\b|\bgo\s+test\b|\b(?:mvn|mvnw)\b[^\n;&|]*\btest\b|\b(?:gradle|gradlew)\b[^\n;&|]*\btest\b|\bctest\b|\bmake\s+test\b/i],
    ['lint', /\b(?:eslint|ruff|biome|shellcheck)\b|\b(?:npm|pnpm|yarn|bun)\s+run\s+lint\b|\bcargo\s+clippy\b/i],
    ['typecheck', /\b(?:mypy|pyright|tsc)\b|\b(?:npm|pnpm|yarn|bun)\s+run\s+(?:typecheck|check)\b|\bcargo\s+check\b|\bgo\s+vet\b/i],
    ['build', /\b(?:npm|pnpm|yarn|bun)\s+run\s+build\b|\bcargo\s+build\b|\bgo\s+build\b|\b(?:mvn|mvnw)\b[^\n;&|]*(?:verify|package)\b|\b(?:gradle|gradlew)\b[^\n;&|]*(?:check|build)\b|\bcmake\s+--build\b|\bmake\s+(?:check|verify|build)\b/i],
    ['static-analysis', /\b(?:sanitizer|asan|ubsan|valgrind|fuzz|clippy|shellcheck)\b/i],
  ];
  for (const [kind, pattern] of rules) if (pattern.test(trimmed)) return kind;
  return null;
}

function verificationCommand(command) {
  return verificationKind(command) !== null;
}

function simpleCommandKnownReadOnly(segment) {
  const trimmed = segment.trim();
  if (!trimmed) return true;
  if (/[>`]|\$\(|`/.test(trimmed) || /(?:^|\s)(?:-delete|-exec|-execdir)(?:\s|$)/i.test(trimmed)) return false;
  if (verificationCommand(trimmed)) return true;

  const gitSubs = gitSubcommands(trimmed);
  if (gitSubs.length === 1 && READ_ONLY_GIT.has(gitSubs[0])) {
    if (gitSubs[0] === 'branch') return /(?:^|\s)--show-current(?:\s|$)/.test(trimmed);
    if (gitSubs[0] === 'config') return /(?:^|\s)(?:--get|--get-all|--get-regexp|--list|-l)(?:\s|$)/.test(trimmed);
    return true;
  }

  const patterns = [
    /^(?:pwd|ls|dir|true|false)(?:\s+[^;&|\n]+)*$/i,
    /^(?:cd|pushd|popd)(?:\s+[^;&|\n]+)*$/i,
    /^(?:cat|head|tail|wc|stat|file|realpath|readlink|which|where(?:\.exe)?|du|tree)(?:\s+[^;&|\n]+)*$/i,
    /^(?:grep|rg|find|jq|awk|cut|sort|uniq)(?:\s+[^;&|\n]+)+$/i,
    /^(?:echo|printf)(?:\s+[^;&|\n]+)*$/i,
    /^(?:node|deno|bun|python|python3|ruby|go|cargo|rustc|java|javac|dotnet)\s+(?:--version|-V|version)$/i,
    /^(?:npm|pnpm|yarn|bun)\s+(?:list|ls|why|view|info)(?:\s+[^;&|\n]+)*$/i,
  ];
  return patterns.some(pattern => pattern.test(trimmed));
}

function shellKnownReadOnly(command) {
  const trimmed = command.trim();
  if (!trimmed) return true;
  if (/\$\(|`/.test(trimmed)) return false;
  const segments = splitShellSegments(trimmed);
  return Boolean(segments?.length) && segments.every(simpleCommandKnownReadOnly);
}

function shellEffect(command) {
  const trimmed = command.trim();
  if (!trimmed) return 'READ_ONLY';
  if (verificationMutationFlag(trimmed) || gitMutation(trimmed) || dependencyCommand(trimmed)) return 'MUTATION';

  const mutationPatterns = [
    /(?:^|[;&|\n]\s*)(?:rm|mv|cp|mkdir|rmdir|touch|truncate|install|patch|dd|tee|chmod|chown|ln)\b/i,
    /\bsed\b[^\n;&|]*\s-i(?:\b|['"]?)/i,
    /\bperl\b[^\n;&|]*\s-pi(?:\b|['"]?)/i,
    /\b(?:npm|pnpm|yarn|bun)\s+run\s+(?:format|fmt|generate|codegen|fix)\b/i,
    /\b(?:prettier|eslint|ruff|biome)\b[^\n;&|]*(?:--write|--fix)\b/i,
  ];
  if (mutationPatterns.some(pattern => pattern.test(trimmed))) return 'MUTATION';

  let quote = null;
  let escaped = false;
  for (const ch of trimmed) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && quote !== "'") { escaped = true; continue; }
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === "'" || ch === '"') { quote = ch; continue; }
    if (ch === '>') return 'MUTATION';
  }

  if (shellKnownReadOnly(trimmed)) return 'READ_ONLY';
  return 'UNKNOWN';
}

function shellPersistentMutation(command) {
  return shellEffect(command) === 'MUTATION';
}

function isPolicyAgentInput(toolInput) {
  const kind = String(toolInput.subagent_type ?? toolInput.agent_type ?? toolInput.type ?? '');
  return kind === POLICY_AGENT || kind === 'doctrine-policy-verifier';
}

function isPolicyAgentType(agentType) {
  const value = String(agentType || '');
  return value === POLICY_AGENT || value === 'doctrine-policy-verifier';
}

function verifierSafeShell(command) {
  return shellEffect(command) === 'READ_ONLY';
}

function unique(items) {
  return [...new Set(items)];
}

function skillsFromPreflight(preflight, manifest) {
  if (!preflight) return [];
  const applicable = [];
  if (preflight.mode === 'BOOTSTRAP' || preflight.mode === 'ARCHITECTURE_CHANGE') {
    applicable.push('design-before-implementation', 'planning');
  }
  if (preflight.migration) applicable.push('planning');
  for (const name of preflight.applicable_skills || preflight.required_skills || []) {
    if (manifest.names.includes(name)) applicable.push(name);
  }
  return unique(applicable);
}

function applicableSkillsForTool(toolName, toolInput, manifest, preflight = null) {
  const applicable = [];

  if (WRITE_TOOLS.has(toolName)) {
    applicable.push('change-governance', ...skillsFromPreflight(preflight, manifest));
    const filePath = toolPath(toolInput);
    if (isTestPath(filePath)) applicable.push('verification-and-evidence');
    else if (isDocumentationPath(filePath)) applicable.push('documentation');
    else applicable.push('implementation');
    if (isDependencyPath(filePath)) applicable.push('external-surface-contracts');
  }

  if (SHELL_TOOLS.has(toolName)) {
    const command = shellCommand(toolInput);
    if (shellPersistentMutation(command)) applicable.push('change-governance', ...skillsFromPreflight(preflight, manifest));
    if (gitMutation(command)) applicable.push('version-control');
    if (dependencyCommand(command)) applicable.push('external-surface-contracts');
    if (verificationCommand(command)) applicable.push('verification-and-evidence');
  }

  if (AGENT_TOOLS.has(toolName) && !isPolicyAgentInput(toolInput)) applicable.push('agentic-execution');

  for (const name of applicable) {
    if (!manifest.names.includes(name)) throw new Error(`routing names unknown skill ${name}`);
  }
  return unique(applicable);
}

function missingSkills(applicable, active) {
  return applicable.filter(name => !active.has(name));
}

function skillAdvisory(toolName, missing) {
  const skills = missing.map(name => `${PLUGIN_NAME}:${name}`).join(', ');
  return `Relevant doctrine skill${missing.length === 1 ? '' : 's'} for ${toolName}: ${skills}. Load when materially relevant.`;
}

function relativeProjectPath(cwd, filePath) {
  if (!filePath) return '';
  const normalizedCwd = path.resolve(cwd || '.');
  const normalizedFile = path.isAbsolute(filePath) ? path.resolve(filePath) : path.resolve(normalizedCwd, filePath);
  const rel = path.relative(normalizedCwd, normalizedFile).replaceAll('\\', '/');
  return rel || '.';
}

function nearestExistingAncestor(filePath) {
  let candidate = filePath;
  while (true) {
    try {
      fs.lstatSync(candidate);
      return candidate;
    } catch (error) {
      if (error?.code !== 'ENOENT') return null;
      const parent = path.dirname(candidate);
      if (parent === candidate) return null;
      candidate = parent;
    }
  }
}

function realPathStaysInside(cwd, filePath) {
  try {
    const root = fs.realpathSync(cwd || '.');
    const target = path.isAbsolute(filePath) ? path.resolve(filePath) : path.resolve(cwd || '.', filePath);
    const existing = nearestExistingAncestor(target);
    if (!existing) return false;
    const realExisting = fs.realpathSync(existing);
    const rel = path.relative(root, realExisting);
    return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel));
  } catch {
    return false;
  }
}

function withinScope(cwd, filePath, roots) {
  if (!filePath || !Array.isArray(roots) || !roots.length) return false;
  const rel = relativeProjectPath(cwd, filePath);
  if (rel.startsWith('../') || rel === '..' || !realPathStaysInside(cwd, filePath)) return false;
  return roots.some(rawRoot => {
    const root = String(rawRoot || '').replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/$/, '');
    if (!root || root === '.') return true;
    return rel === root || rel.startsWith(`${root}/`);
  });
}

function repoWideScope(roots) {
  return Array.isArray(roots) && roots.some(raw => {
    const root = String(raw || '').replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/$/, '');
    return !root || root === '.';
  });
}

function exactObjectKeys(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, i) => key === wanted[i]);
}

function validatePreflightVerdict(value, manifest) {
  const keys = ['phase', 'status', 'mode', 'migration', 'confidence', 'scope_roots', 'architecture_reasons', 'concerns', 'applicable_skills', 'recommended_verification_kinds', 'summary'];
  if (!exactObjectKeys(value, keys)) return 'PRE_CHANGE verdict must contain exactly the documented fields';
  if (value.phase !== 'PRE_CHANGE') return 'phase must be PRE_CHANGE';
  if (!['PASS', 'CONCERNS'].includes(value.status)) return 'status must be PASS or CONCERNS';
  if (!['NORMAL_DEVELOPMENT', 'BOOTSTRAP', 'ARCHITECTURE_CHANGE'].includes(value.mode)) return 'invalid mode';
  if (typeof value.migration !== 'boolean') return 'migration must be boolean';
  if (!['high', 'medium', 'low'].includes(value.confidence)) return 'confidence must be high, medium, or low';
  if (!Array.isArray(value.scope_roots) || value.scope_roots.some(x => typeof x !== 'string')) return 'scope_roots must be a string array';
  for (const raw of value.scope_roots) {
    const root = raw.replaceAll('\\', '/').trim();
    if (!root || path.posix.isAbsolute(root) || root === '..' || root.startsWith('../') || root.includes('/../') || /[*?{}[\]]/.test(root)) {
      return 'scope_roots must contain normalized repository-relative literal prefixes; use . explicitly for repository-wide scope';
    }
  }
  if (!Array.isArray(value.architecture_reasons) || value.architecture_reasons.some(x => typeof x !== 'string')) return 'architecture_reasons must be a string array';
  if (!Array.isArray(value.concerns) || value.concerns.some(x => typeof x !== 'string')) return 'concerns must be a string array';
  if (!Array.isArray(value.applicable_skills) || value.applicable_skills.some(x => !manifest.names.includes(x))) return 'applicable_skills contains an unknown skill';
  if (!Array.isArray(value.recommended_verification_kinds) || value.recommended_verification_kinds.some(x => !TRACKABLE_VERIFICATION_KINDS.has(x))) return 'recommended_verification_kinds contains an unsupported kind';
  if (typeof value.summary !== 'string' || !value.summary.trim()) return 'summary is required';
  if (value.migration && value.mode !== 'ARCHITECTURE_CHANGE') return 'migration requires ARCHITECTURE_CHANGE';
  if (value.status === 'PASS' && (value.confidence === 'low' || value.concerns.length)) return 'PASS cannot carry low confidence or unresolved concerns';
  if (value.status === 'CONCERNS' && !value.concerns.length) return 'CONCERNS requires at least one concrete concern';
  if (value.mode !== 'NORMAL_DEVELOPMENT' && value.status === 'PASS' && !value.architecture_reasons.length) return 'BOOTSTRAP/ARCHITECTURE_CHANGE PASS requires architecture_reasons';
  return null;
}

function currentSuccessfulVerifications(state) {
  return (state?.verifications || []).filter(v => v.success && v.verificationRevision === state.verificationRevision);
}

function validateCompletionVerdict(value, state) {
  const keys = ['phase', 'status', 'mode_consistent', 'scope_consistent', 'verification_adequate', 'review_adequate', 'claims_bounded', 'evidence_tool_use_ids', 'missing_verification', 'material_findings', 'summary'];
  if (!exactObjectKeys(value, keys)) return 'COMPLETION verdict must contain exactly the documented fields';
  if (value.phase !== 'COMPLETION') return 'phase must be COMPLETION';
  if (!['PASS', 'CONCERNS'].includes(value.status)) return 'status must be PASS or CONCERNS';
  for (const field of ['mode_consistent', 'scope_consistent', 'verification_adequate', 'review_adequate', 'claims_bounded']) {
    if (typeof value[field] !== 'boolean') return `${field} must be boolean`;
  }
  for (const field of ['evidence_tool_use_ids', 'missing_verification', 'material_findings']) {
    if (!Array.isArray(value[field]) || value[field].some(x => typeof x !== 'string')) return `${field} must be a string array`;
  }
  if (typeof value.summary !== 'string' || !value.summary.trim()) return 'summary is required';
  const allTrue = value.mode_consistent && value.scope_consistent && value.verification_adequate && value.review_adequate && value.claims_bounded;
  if (value.status === 'PASS' && (!allTrue || value.missing_verification.length || value.material_findings.length)) {
    return 'PASS requires every completion predicate true and no missing verification/material findings';
  }
  if (value.status === 'CONCERNS' && allTrue && !value.missing_verification.length && !value.material_findings.length) {
    return 'CONCERNS requires at least one concrete failing predicate or finding';
  }

  const byId = new Map((state?.verifications || []).map(v => [String(v.toolUseId || ''), v]));
  for (const id of value.evidence_tool_use_ids) {
    const evidence = byId.get(id);
    if (!id || !evidence) return `evidence_tool_use_ids references unknown verification tool_use_id ${id || '(empty)'}`;
    if (!evidence.success) return `evidence_tool_use_ids references failed verification ${id}`;
    if (evidence.verificationRevision !== state.verificationRevision) return `evidence_tool_use_ids references stale verification ${id}`;
  }

  if (value.status === 'PASS') {
    const current = currentSuccessfulVerifications(state);
    const recommendedKinds = new Set(state?.preflight?.recommended_verification_kinds || state?.preflight?.required_verification_kinds || []);
    for (const kind of recommendedKinds) {
      if (!current.some(v => v.kind === kind)) return `recommended verification kind ${kind} has no successful evidence at current verification revision`;
      if (!value.evidence_tool_use_ids.some(id => byId.get(id)?.kind === kind)) return `PASS must cite current successful ${kind} evidence by tool_use_id`;
    }
    if (state.verificationRevision > 0 && !current.length) {
      return 'PASS after behavior-affecting mutation requires at least one successful verification at the current verification revision';
    }
    if (state.verificationRevision > 0 && !value.evidence_tool_use_ids.length) {
      return 'PASS after behavior-affecting mutation must cite the successful verification evidence it relies on';
    }
  }
  return null;
}

function extractPolicyVerdict(text) {
  const raw = String(text || '');
  const marker = 'ENGINEERING_DOCTRINE_POLICY_V1';
  const index = raw.indexOf(marker);
  if (index < 0) return null;
  const tail = raw.slice(index + marker.length);
  const first = tail.indexOf('{');
  if (first < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = first; i < tail.length; i++) {
    const ch = tail[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(tail.slice(first, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
}

function truncate(value, max = 7000) {
  let text;
  try { text = typeof value === 'string' ? value : JSON.stringify(value); }
  catch { text = String(value); }
  if (text.length <= max) return text;
  const half = Math.floor(max / 2);
  return `${text.slice(0, half)}\n... [${text.length - max} chars omitted by policy recorder] ...\n${text.slice(-half)}`;
}

function boundedPush(list, value, max) {
  list.push(value);
  if (list.length > max) list.splice(0, list.length - max);
}

function advisoryRecord({ code, severity = 'warning', message, tool = null, toolUseId = '' }) {
  return {
    code,
    severity,
    message: truncate(message, 1600),
    tool,
    toolUseId,
    recordedAt: new Date().toISOString(),
  };
}

function compactMutation(record) {
  return {
    seq: record.seq,
    reviewRevision: record.reviewRevision,
    verificationRevision: record.verificationRevision,
    tool: record.tool,
    path: record.path,
    targetKnown: record.targetKnown,
    kind: record.kind,
    command: record.command ? truncate(record.command, 300) : null,
    toolUseId: record.toolUseId,
  };
}

function compactVerification(record) {
  return {
    kind: record.kind,
    command: truncate(record.command, 300),
    success: record.success,
    reviewRevision: record.reviewRevision,
    verificationRevision: record.verificationRevision,
    output: truncate(record.output, 800),
    toolUseId: record.toolUseId,
  };
}

function compactFailure(record) {
  return {
    tool: record.tool,
    command: record.command ? truncate(record.command, 300) : null,
    verificationKind: record.verificationKind,
    reviewRevision: record.reviewRevision,
    verificationRevision: record.verificationRevision,
    error: truncate(record.error, 800),
    interrupted: record.interrupted,
    toolUseId: record.toolUseId,
  };
}

function compactAdvisory(record) {
  return {
    code: record.code,
    severity: record.severity,
    message: truncate(record.message, 600),
    tool: record.tool,
    toolUseId: record.toolUseId,
    contextEpoch: record.contextEpoch,
    recordedAt: record.recordedAt,
  };
}

function mutationClassification(toolName, toolInput) {
  if (WRITE_TOOLS.has(toolName)) {
    const filePath = toolPath(toolInput);
    return {
      effect: 'MUTATION',
      persistent: true,
      reviewAffecting: true,
      verificationAffecting: !isDocumentationPath(filePath),
      path: filePath,
      targetKnown: Boolean(filePath),
      kind: isDocumentationPath(filePath) ? 'documentation'
        : isTestPath(filePath) ? 'test'
          : isDependencyPath(filePath) ? 'dependency'
            : 'content',
    };
  }

  if (SHELL_TOOLS.has(toolName)) {
    const command = shellCommand(toolInput);
    const effect = shellEffect(command);
    if (effect !== 'MUTATION') {
      return {
        effect,
        persistent: false,
        reviewAffecting: false,
        verificationAffecting: false,
        path: '',
        targetKnown: effect === 'READ_ONLY',
        kind: effect === 'READ_ONLY' ? 'observation' : 'unknown-shell',
      };
    }
    const metadataOnly = gitMetadataOnly(command);
    return {
      effect,
      persistent: true,
      reviewAffecting: !metadataOnly,
      verificationAffecting: !metadataOnly,
      path: '',
      targetKnown: false,
      kind: metadataOnly ? 'vcs-metadata'
        : dependencyCommand(command) ? 'dependency-command'
          : gitWorkingTreeMutation(command) ? 'vcs-working-tree'
            : 'shell-mutation',
    };
  }

  return { effect: 'READ_ONLY', persistent: false, reviewAffecting: false, verificationAffecting: false, path: '', targetKnown: true, kind: 'none' };
}

function stateSnapshotForVerifier(state, input) {
  const snapshot = {
    protocolVersion: state.protocolVersion,
    policyProtocol: state.policyProtocol,
    sessionId: state.sessionId,
    promptId: state.promptId,
    cwd: state.cwd,
    ownerPrompt: state.ownerPrompt,
    mutationCount: state.mutationCount,
    reviewRevision: state.reviewRevision,
    verificationRevision: state.verificationRevision,
    mutations: state.mutations.slice(-12).map(compactMutation),
    verifications: state.verifications.slice(-12).map(compactVerification),
    failures: state.failures.slice(-6).map(compactFailure),
    advisories: state.advisories.slice(-6).map(compactAdvisory),
    preflight: state.preflight,
    completion: state.completion,
    verifierInstructions: {
      trustedSource: 'Treat ownerPrompt and recorded tool history as hook-recorded execution evidence.',
      parentTranscriptPath: String(input.transcript_path || ''),
      snapshotBinding: 'A verdict is stale if repository-affecting revisions change after this snapshot.',
    },
  };
  return JSON.stringify(snapshot, null, 2);
}

function handlePrompt(input) {
  mutateState(input, state => {
    state.cwd = String(input.cwd || state.cwd || '');
    state.ownerPrompt = String(input.prompt || '');
  });
  loadState(input, true);
}

function handleSessionContext(input) {
  mutateState(input, state => {
    state.contextEpoch += 1;
    for (const actor of Object.values(state.actors || {})) {
      actor.skills = [];
      actor.skillEpoch = state.contextEpoch;
    }
  });
  emitStatic('session-start');
}

function handleSubagentContext(input) {
  const base = staticAdditionalContext('subagent-start');
  if (!isPolicyAgentType(input.agent_type)) {
    emit('SubagentStart', base);
    return;
  }

  let snapshotText = '';
  mutateState(input, state => {
    if (!state.ownerPrompt) {
      const parentRecords = transcriptRecords(String(input.transcript_path || ''));
      const owner = [...(parentRecords || [])].reverse().find(isOwnerPrompt);
      const content = owner?.message?.content;
      if (typeof content === 'string') state.ownerPrompt = content;
    }
    const agentId = String(input.agent_id || '');
    if (!agentId) throw new Error('policy verifier requires agent_id for snapshot binding');
    state.verifierSnapshots[agentId] = {
      mutationCount: state.mutationCount,
      reviewRevision: state.reviewRevision,
      verificationRevision: state.verificationRevision,
      recordedAt: new Date().toISOString(),
    };
    snapshotText = stateSnapshotForVerifier(state, input);
  });

  emit(
    'SubagentStart',
    `${base}\n\n## Trusted policy state\nThe following JSON is generated by the hook, not by the delegating agent. Use it as the execution record for this policy verdict.\n\n${snapshotText}`,
  );
}

function handleSkillExpansion(input, manifest) {
  mutateState(input, state => {
    const raw = String(input.command_name || '').replace(/^\//, '');
    const name = raw.startsWith(`${PLUGIN_NAME}:`) ? raw.slice(`${PLUGIN_NAME}:`.length) : raw;
    if (manifest.names.includes(name)) {
      const actor = actorState(state, input);
      actor.skills = unique([...(actor.skills || []), name]);
      actor.skillEpoch = state.contextEpoch;
    }
  });
}

function preflightAdvisoryReason(state) {
  const preflight = state?.preflight;
  if (!preflight || preflight.status !== 'CONCERNS') return null;
  const concerns = (preflight.concerns || []).join('; ') || preflight.summary || 'unresolved concerns';
  return `PRE_CHANGE concerns: ${concerns}. Keep them visible and bound later claims to the evidence actually obtained.`;
}

function scopeAdvisoryReason(state, input, mutation) {
  const roots = state?.preflight?.scope_roots || [];
  if (!roots.length || !mutation.persistent || !mutation.reviewAffecting) return null;
  if (mutation.targetKnown && mutation.path) {
    if (withinScope(String(input.cwd || state.cwd || ''), mutation.path, roots)) return null;
    return `Scope drift: ${relativeProjectPath(String(input.cwd || state.cwd || ''), mutation.path)} is outside PRE_CHANGE scope [${roots.join(', ')}] or crosses a symlink outside the repository.`;
  }
  if (!mutation.targetKnown && !repoWideScope(roots)) {
    return `Scope unknown: shell mutation target cannot be proven against PRE_CHANGE scope [${roots.join(', ')}].`;
  }
  return null;
}

function handlePreTool(input, manifest) {
  const toolName = String(input.tool_name || 'unknown');
  const toolInput = input.tool_input || {};
  const notices = [];

  if (isPolicyAgentType(input.agent_type) && SHELL_TOOLS.has(toolName)) {
    const command = shellCommand(toolInput);
    if (!verifierSafeShell(command)) {
      const effect = shellEffect(command);
      notices.push(advisoryRecord({
        code: 'verifier-shell-effect',
        severity: effect === 'MUTATION' ? 'high-risk' : 'warning',
        tool: toolName,
        toolUseId: String(input.tool_use_id || ''),
        message: `${POLICY_AGENT} must remain read-only; shell effect classified as ${effect}.`,
      }));
    }
  }

  if (AGENT_TOOLS.has(toolName) && isPolicyAgentInput(toolInput)) {
    const requested = String(toolInput.prompt || '').trim();
    if (!['PRE_CHANGE', 'COMPLETION'].includes(requested)) {
      notices.push(advisoryRecord({
        code: 'verifier-invocation-shape',
        severity: 'warning',
        tool: toolName,
        toolUseId: String(input.tool_use_id || ''),
        message: `${POLICY_AGENT} expects PRE_CHANGE or COMPLETION; a nonstandard prompt may not produce a recordable verdict.`,
      }));
    }
  }

  const mutation = mutationClassification(toolName, toolInput);
  const state = loadState(input, true);
  if (mutation.persistent && mutation.reviewAffecting) {
    const preflightReason = preflightAdvisoryReason(state);
    if (preflightReason) {
      notices.push(advisoryRecord({
        code: 'preflight-concerns',
        severity: 'warning',
        tool: toolName,
        toolUseId: String(input.tool_use_id || ''),
        message: preflightReason,
      }));
    }
    const scopeReason = scopeAdvisoryReason(state, input, mutation);
    if (scopeReason) {
      notices.push(advisoryRecord({
        code: 'scope-drift',
        severity: 'warning',
        tool: toolName,
        toolUseId: String(input.tool_use_id || ''),
        message: scopeReason,
      }));
    }
  }

  const applicable = applicableSkillsForTool(
    toolName,
    toolInput,
    manifest,
    mutation.persistent && mutation.reviewAffecting ? state.preflight : null,
  );
  if (applicable.length) {
    const active = activeSkills(input, manifest);
    const missing = missingSkills(applicable, active);
    if (missing.length) {
      notices.push(advisoryRecord({
        code: 'skill-routing',
        severity: 'info',
        tool: toolName,
        toolUseId: String(input.tool_use_id || ''),
        message: skillAdvisory(toolName, missing),
      }));
    }
  }

  if (!notices.length) return;
  const fresh = mutateState(input, current => {
    const emitted = [];
    for (const notice of notices) {
      const duplicate = current.advisories.some(existing => (
        existing.contextEpoch === current.contextEpoch
        && existing.code === notice.code
        && existing.message === notice.message
      ));
      if (duplicate) continue;
      const recorded = { ...notice, contextEpoch: current.contextEpoch };
      boundedPush(current.advisories, recorded, MAX_ADVISORIES);
      emitted.push(recorded);
    }
    return emitted;
  });
  if (fresh.length) emit('PreToolUse', fresh.map(notice => `[${notice.severity}] ${notice.message}`).join('\n'));
}

function handlePostTool(input, manifest) {
  const toolName = String(input.tool_name || 'unknown');
  const toolInput = input.tool_input || {};

  mutateState(input, state => {
    if (toolName === 'Skill') {
      const requested = String(toolInput.skill ?? toolInput.name ?? '');
      const prefix = `${PLUGIN_NAME}:`;
      const name = requested.startsWith(prefix) ? requested.slice(prefix.length) : requested;
      if (manifest.names.includes(name)) {
        const actor = actorState(state, input);
        actor.skills = unique([...(actor.skills || []), name]);
        actor.skillEpoch = state.contextEpoch;
      }
      return;
    }

    const mutation = mutationClassification(toolName, toolInput);
    if (mutation.persistent) {
      state.mutationCount += 1;
      if (mutation.reviewAffecting) state.reviewRevision += 1;
      if (mutation.verificationAffecting) state.verificationRevision += 1;
      if (mutation.reviewAffecting || mutation.verificationAffecting) state.completion = null;
      boundedPush(state.mutations, {
        seq: state.mutationCount,
        reviewRevision: state.reviewRevision,
        verificationRevision: state.verificationRevision,
        tool: toolName,
        path: mutation.path ? relativeProjectPath(String(input.cwd || state.cwd || ''), mutation.path) : null,
        targetKnown: mutation.targetKnown,
        kind: mutation.kind,
        command: SHELL_TOOLS.has(toolName) ? truncate(shellCommand(toolInput), 2000) : null,
        toolUseId: String(input.tool_use_id || ''),
      }, 200);
    }

    if (SHELL_TOOLS.has(toolName)) {
      const command = shellCommand(toolInput);
      const kind = verificationKind(command);
      if (kind) {
        boundedPush(state.verifications, {
          kind,
          command: truncate(command, 3000),
          success: true,
          reviewRevision: state.reviewRevision,
          verificationRevision: state.verificationRevision,
          output: truncate(input.tool_response, 7000),
          toolUseId: String(input.tool_use_id || ''),
        }, 200);
      }
    }
  });
}

function handleFailure(input) {
  const toolName = String(input.tool_name || 'tool');
  const toolInput = input.tool_input || {};
  const command = SHELL_TOOLS.has(toolName) ? shellCommand(toolInput) : '';
  const kind = command ? verificationKind(command) : null;

  mutateState(input, state => {
    boundedPush(state.failures, {
      tool: toolName,
      command: command ? truncate(command, 3000) : null,
      verificationKind: kind,
      reviewRevision: state.reviewRevision,
      verificationRevision: state.verificationRevision,
      error: truncate(input.error || 'tool failure', 7000),
      interrupted: Boolean(input.is_interrupt),
      toolUseId: String(input.tool_use_id || ''),
    }, 100);
    if (kind) {
      boundedPush(state.verifications, {
        kind,
        command: truncate(command, 3000),
        success: false,
        reviewRevision: state.reviewRevision,
        verificationRevision: state.verificationRevision,
        output: truncate(input.error || 'tool failure', 7000),
        toolUseId: String(input.tool_use_id || ''),
      }, 200);
    }
  });
  emit('PostToolUseFailure', FAILURE_CHECKPOINT(toolName));
}

function collectToolNames(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) collectToolNames(item, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (node.type === 'tool_use' && typeof node.name === 'string') out.add(node.name);
  for (const value of Object.values(node)) collectToolNames(value, out);
}

function verifierInspectedRepository(input) {
  const records = transcriptRecords(String(input.agent_transcript_path || ''));
  if (!records) return false;
  const names = new Set();
  for (const record of records) collectToolNames(record, names);
  return [...names].some(name => INSPECTION_TOOLS.has(name));
}

function verifierRequestedPhase(input) {
  const records = transcriptRecords(String(input.agent_transcript_path || '')) || [];
  for (const record of records) {
    if (!isOwnerPrompt(record)) continue;
    const content = record.message?.content;
    if (typeof content === 'string') {
      const phase = content.trim();
      if (phase === 'PRE_CHANGE' || phase === 'COMPLETION') return phase;
    }
    if (Array.isArray(content)) {
      const text = content.filter(item => item?.type === 'text').map(item => String(item.text || '')).join('').trim();
      if (text === 'PRE_CHANGE' || text === 'COMPLETION') return text;
    }
  }
  return null;
}

function recordVerifierProtocolAdvisory(input, message) {
  mutateState(input, state => {
    boundedPush(state.advisories, advisoryRecord({
      code: 'verifier-protocol',
      severity: 'warning',
      tool: 'Agent',
      message,
    }), MAX_ADVISORIES);
  });
  process.stderr.write(`Engineering Doctrine advisory: ${message}\n`);
}

function policyVerifierStop(input, manifest) {
  const verdict = extractPolicyVerdict(input.last_assistant_message);
  if (!verdict) {
    recordVerifierProtocolAdvisory(input, 'Optional policy verifier did not return one ENGINEERING_DOCTRINE_POLICY_V1 verdict object; no verdict was recorded.');
    return;
  }

  const requestedPhase = verifierRequestedPhase(input);
  if (!requestedPhase) {
    recordVerifierProtocolAdvisory(input, 'Optional policy verifier transcript did not contain a recognized PRE_CHANGE or COMPLETION request; no verdict was recorded.');
    return;
  }
  if (verdict.phase !== requestedPhase) {
    recordVerifierProtocolAdvisory(input, `Optional policy verifier returned phase ${verdict.phase || '(missing)'} for ${requestedPhase}; no verdict was recorded.`);
    return;
  }
  if (!verifierInspectedRepository(input)) {
    recordVerifierProtocolAdvisory(input, 'Optional policy verifier did not inspect repository evidence before its verdict; no verdict was recorded.');
    return;
  }

  let protocolError = null;
  mutateState(input, state => {
    const agentId = String(input.agent_id || '');
    const issued = state.verifierSnapshots?.[agentId];
    if (!issued) {
      protocolError = 'no hook-issued verifier snapshot exists for this agent';
      return;
    }
    if (
      issued.mutationCount !== state.mutationCount
      || issued.reviewRevision !== state.reviewRevision
      || issued.verificationRevision !== state.verificationRevision
    ) {
      delete state.verifierSnapshots[agentId];
      protocolError = `verifier snapshot is stale: issued mutation/review/verification ${issued.mutationCount}/${issued.reviewRevision}/${issued.verificationRevision}, current ${state.mutationCount}/${state.reviewRevision}/${state.verificationRevision}`;
      return;
    }

    let error;
    if (verdict.phase === 'PRE_CHANGE') error = validatePreflightVerdict(verdict, manifest);
    else if (verdict.phase === 'COMPLETION') error = validateCompletionVerdict(verdict, state);
    else error = 'phase must be PRE_CHANGE or COMPLETION';

    if (error) {
      protocolError = error;
      return;
    }

    if (verdict.phase === 'PRE_CHANGE') {
      state.preflight = {
        ...verdict,
        verifiedReviewRevision: issued.reviewRevision,
        verifiedVerificationRevision: issued.verificationRevision,
        agentId,
        recordedAt: new Date().toISOString(),
      };
      state.completion = null;
    } else {
      state.completion = {
        ...verdict,
        verifiedReviewRevision: issued.reviewRevision,
        verifiedVerificationRevision: issued.verificationRevision,
        agentId,
        recordedAt: new Date().toISOString(),
      };
    }
    delete state.verifierSnapshots[agentId];
  });

  if (protocolError) {
    recordVerifierProtocolAdvisory(input, `Optional policy verifier verdict was not recorded: ${protocolError}.`);
  }
}

function handleStop(input, manifest) {
  if (isPolicyAgentType(input.agent_type)) policyVerifierStop(input, manifest);
}

function handleTaskCompleted(_input) {
  // Completion is intentionally non-blocking. Evidence remains available in policy state.
}

export const __test = {
  hasShellControlSyntax,
  gitSubcommands,
  gitMutation,
  gitWorkingTreeMutation,
  gitMetadataOnly,
  verificationKind,
  shellKnownReadOnly,
  shellEffect,
  shellPersistentMutation,
  mutationClassification,
  applicableSkillsForTool,
  relativeProjectPath,
  repoWideScope,
  validatePreflightVerdict,
  validateCompletionVerdict,
  extractPolicyVerdict,
  stateSnapshotForVerifier,
};

function main() {
  const mode = process.argv[2];
  try {
    if (mode === 'session-context') handleSessionContext(readStdinJson());
    else if (mode === 'subagent-context') handleSubagentContext(readStdinJson());
    else if (mode === 'prompt') handlePrompt(readStdinJson());
    else if (mode === 'skill-expansion') handleSkillExpansion(readStdinJson(), loadManifest());
    else if (mode === 'pre-tool') handlePreTool(readStdinJson(), loadManifest());
    else if (mode === 'post-tool') handlePostTool(readStdinJson(), loadManifest());
    else if (mode === 'stop') handleStop(readStdinJson(), loadManifest());
    else if (mode === 'subagent-stop') handleStop(readStdinJson(), loadManifest());
    else if (mode === 'task-completed') handleTaskCompleted(readStdinJson());
    else if (mode === 'failure') handleFailure(readStdinJson());
    else throw new Error(`unknown doctrine runtime mode: ${mode || '(missing)'}`);
  } catch (error) {
    process.stderr.write(`Engineering Doctrine hook failure (${mode || 'unknown'}): ${error?.message || error}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
