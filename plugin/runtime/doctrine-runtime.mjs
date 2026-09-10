import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_NAME = 'engineering-doctrine';
const POLICY_AGENT = `${PLUGIN_NAME}:doctrine-policy-verifier`;
const POLICY_PROTOCOL = 1;
const STATE_PROTOCOL = 4;
const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(runtimeDir, '..');
const projectionMapPath = path.join(pluginRoot, 'doctrine', 'projection-map.json');

const WRITE_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit']);
const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
const AGENT_TOOLS = new Set(['Agent']);
const INSPECTION_TOOLS = new Set(['Read', 'Grep', 'Glob', 'Bash', 'PowerShell']);
const TRACKABLE_VERIFICATION_KINDS = new Set(['test', 'lint', 'typecheck', 'build', 'static-analysis']);
const DELIVERY_PREAMBLE = 'Base directory for this skill';
const LOCK_WAIT_MS = 3500;
const LOCK_STALE_MS = 15000;
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

function deny(reason) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  })}\n`);
}

function blockStop(reason) {
  process.stdout.write(`${JSON.stringify({ decision: 'block', reason })}\n`);
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

function gitSubcommands(command) {
  const out = [];
  const regex = /(?:^|[;&|\n]\s*)git(?:\s+-\S+(?:\s+\S+)*)*\s+([a-z-]+)\b/gi;
  for (const match of command.matchAll(regex)) out.push(match[1].toLowerCase());
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
  if (hasShellControlSyntax(command)) return false;
  const subs = gitSubcommands(command);
  return subs.length === 1 && GIT_METADATA_ONLY.has(subs[0]);
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

function shellKnownReadOnly(command) {
  const trimmed = command.trim();
  if (!trimmed) return true;
  if (hasShellControlSyntax(trimmed)) return false;
  if (verificationCommand(trimmed)) return true;
  if (/[$()]/.test(trimmed) || /(?:^|\s)(?:-delete|-exec|-execdir)(?:\s|$)/i.test(trimmed)) return false;
  const patterns = [
    /^(?:pwd|ls|dir)(?:\s+[^;&|\n]+)*$/i,
    /^(?:cat|head|tail|wc|stat|file|realpath|readlink|which|where(?:\.exe)?)(?:\s+[^;&|\n]+)+$/i,
    /^(?:grep|rg)(?:\s+[^;&|\n]+)+$/i,
    /^git\s+(?:status|log|show|grep|rev-parse|ls-files|diff)(?:\s+[^;&|\n]+)*$/i,
    /^git\s+branch\s+--show-current$/i,
    /^(?:node|deno|bun|python|python3|ruby|go|cargo|rustc|java|javac|dotnet)\s+(?:--version|-V|version)$/i,
    /^(?:npm|pnpm|yarn|bun)\s+(?:list|ls|why|view|info)(?:\s+[^;&|\n]+)*$/i,
  ];
  return patterns.some(pattern => pattern.test(trimmed));
}

function shellPersistentMutation(command) {
  const trimmed = command.trim();
  if (!trimmed) return false;
  if (hasShellControlSyntax(trimmed)) return true;
  if (gitMutation(trimmed) || dependencyCommand(trimmed) || verificationMutationFlag(trimmed)) return true;

  const patterns = [
    /^(?:rm|mv|cp|mkdir|rmdir|touch|truncate|install|patch|dd|tee|chmod|chown|ln)\b/i,
    /\bsed\b[^\n;&|]*\s-i(?:\b|['"]?)/i,
    /\bperl\b[^\n;&|]*\s-pi(?:\b|['"]?)/i,
    /\b(?:npm|pnpm|yarn|bun)\s+run\s+(?:format|fmt|generate|codegen|fix)\b/i,
    /\b(?:prettier|eslint|ruff|biome)\b[^\n;&|]*(?:--write|--fix)\b/i,
  ];
  if (patterns.some(pattern => pattern.test(trimmed))) return true;
  return !shellKnownReadOnly(trimmed);
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
  const trimmed = command.trim();
  if (!trimmed || hasShellControlSyntax(trimmed) || /[$()]/.test(trimmed)) return false;
  const allowed = [
    /^git\s+status\s+--porcelain(?:=v1)?(?:\s+-uno)?$/i,
    /^git\s+rev-parse\s+--show-toplevel$/i,
    /^git\s+ls-files(?:\s+--\s+.+)?$/i,
    /^git\s+diff\s+(?=.*--no-ext-diff)(?=.*--no-textconv)[A-Za-z0-9_./=:+,@%~^\-\s]*$/i,
  ];
  return allowed.some(pattern => pattern.test(trimmed));
}

function unique(items) {
  return [...new Set(items)];
}

function requiredByPreflight(preflight, manifest) {
  if (!preflight || preflight.status !== 'ALLOW') return [];
  const required = ['change-governance', 'implementation'];
  if (preflight.mode === 'BOOTSTRAP' || preflight.mode === 'ARCHITECTURE_CHANGE') {
    required.push('design-before-implementation', 'planning', 'verification-and-evidence');
  }
  if (preflight.migration) required.push('planning', 'verification-and-evidence');
  for (const name of preflight.required_skills || []) {
    if (manifest.names.includes(name)) required.push(name);
  }
  return unique(required);
}

function requirementsForTool(toolName, toolInput, manifest, preflight = null) {
  const required = [];

  if (WRITE_TOOLS.has(toolName)) {
    required.push(...requiredByPreflight(preflight, manifest));
    if (!preflight) required.push('change-governance');
    const filePath = toolPath(toolInput);
    if (isTestPath(filePath)) required.push('verification-and-evidence');
    else if (isDocumentationPath(filePath)) required.push('documentation');
    else required.push('implementation');
    if (isDependencyPath(filePath)) required.push('external-surface-contracts');
  }

  if (SHELL_TOOLS.has(toolName)) {
    const command = shellCommand(toolInput);
    required.push(...requiredByPreflight(preflight, manifest));
    if (!preflight && shellPersistentMutation(command)) required.push('change-governance');
    if (gitMutation(command)) required.push('version-control');
    if (dependencyCommand(command)) required.push('external-surface-contracts');
    if (verificationCommand(command)) required.push('verification-and-evidence');
  }

  if (AGENT_TOOLS.has(toolName)) {
    if (isPolicyAgentInput(toolInput)) required.push('change-governance');
    else required.push('agentic-execution');
  }

  for (const name of required) {
    if (!manifest.names.includes(name)) throw new Error(`hard gate names unknown skill ${name}`);
  }
  return unique(required);
}

function missingSkills(required, active) {
  return required.filter(name => !active.has(name));
}

function gateReason(toolName, missing) {
  const skills = missing.map(name => `${PLUGIN_NAME}:${name}`).join(', ');
  return `Engineering Doctrine hard gate: ${toolName} requires ${skills} in the current prompt/context epoch. Invoke every named skill with the Skill tool, then retry the same semantic action. Do not bypass this denial through Bash, another write tool, a subagent, or a different command path.`;
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
  const keys = ['phase', 'status', 'mode', 'migration', 'confidence', 'scope_roots', 'architecture_reasons', 'blocking_reasons', 'required_skills', 'required_verification_kinds', 'summary'];
  if (!exactObjectKeys(value, keys)) return 'PRE_CHANGE verdict must contain exactly the documented fields';
  if (value.phase !== 'PRE_CHANGE') return 'phase must be PRE_CHANGE';
  if (!['ALLOW', 'BLOCK'].includes(value.status)) return 'status must be ALLOW or BLOCK';
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
  if (!Array.isArray(value.blocking_reasons) || value.blocking_reasons.some(x => typeof x !== 'string')) return 'blocking_reasons must be a string array';
  if (!Array.isArray(value.required_skills) || value.required_skills.some(x => !manifest.names.includes(x))) return 'required_skills contains an unknown skill';
  if (!Array.isArray(value.required_verification_kinds) || value.required_verification_kinds.some(x => !TRACKABLE_VERIFICATION_KINDS.has(x))) return 'required_verification_kinds contains an unsupported kind';
  if (typeof value.summary !== 'string' || !value.summary.trim()) return 'summary is required';
  if (value.migration && value.mode !== 'ARCHITECTURE_CHANGE') return 'migration requires ARCHITECTURE_CHANGE';
  if (value.status === 'ALLOW' && !value.scope_roots.length) return 'ALLOW requires at least one explicit scope root';
  if (value.status === 'ALLOW' && (value.confidence === 'low' || value.blocking_reasons.length)) return 'ALLOW cannot carry low confidence or blocking reasons';
  if (value.status === 'BLOCK' && !value.blocking_reasons.length) return 'BLOCK requires blocking_reasons';
  if (value.mode !== 'NORMAL_DEVELOPMENT' && value.status === 'ALLOW' && !value.architecture_reasons.length) return 'BOOTSTRAP/ARCHITECTURE_CHANGE ALLOW requires architecture_reasons';
  return null;
}

function currentSuccessfulVerifications(state) {
  return (state?.verifications || []).filter(v => v.success && v.verificationRevision === state.verificationRevision);
}

function validateCompletionVerdict(value, state) {
  const keys = ['phase', 'status', 'mode_consistent', 'scope_consistent', 'verification_adequate', 'review_adequate', 'claims_bounded', 'evidence_tool_use_ids', 'missing_verification', 'material_findings', 'summary'];
  if (!exactObjectKeys(value, keys)) return 'COMPLETION verdict must contain exactly the documented fields';
  if (value.phase !== 'COMPLETION') return 'phase must be COMPLETION';
  if (!['ALLOW', 'BLOCK'].includes(value.status)) return 'status must be ALLOW or BLOCK';
  for (const field of ['mode_consistent', 'scope_consistent', 'verification_adequate', 'review_adequate', 'claims_bounded']) {
    if (typeof value[field] !== 'boolean') return `${field} must be boolean`;
  }
  for (const field of ['evidence_tool_use_ids', 'missing_verification', 'material_findings']) {
    if (!Array.isArray(value[field]) || value[field].some(x => typeof x !== 'string')) return `${field} must be a string array`;
  }
  if (typeof value.summary !== 'string' || !value.summary.trim()) return 'summary is required';
  const allTrue = value.mode_consistent && value.scope_consistent && value.verification_adequate && value.review_adequate && value.claims_bounded;
  if (value.status === 'ALLOW' && (!allTrue || value.missing_verification.length || value.material_findings.length)) {
    return 'ALLOW requires every completion predicate true and no missing verification/material findings';
  }
  if (value.status === 'BLOCK' && allTrue && !value.missing_verification.length && !value.material_findings.length) {
    return 'BLOCK requires at least one concrete failing predicate or finding';
  }

  const byId = new Map((state?.verifications || []).map(v => [String(v.toolUseId || ''), v]));
  for (const id of value.evidence_tool_use_ids) {
    const evidence = byId.get(id);
    if (!id || !evidence) return `evidence_tool_use_ids references unknown verification tool_use_id ${id || '(empty)'}`;
    if (!evidence.success) return `evidence_tool_use_ids references failed verification ${id}`;
    if (evidence.verificationRevision !== state.verificationRevision) return `evidence_tool_use_ids references stale verification ${id}`;
  }

  if (value.status === 'ALLOW') {
    const current = currentSuccessfulVerifications(state);
    const requiredKinds = new Set(state?.preflight?.required_verification_kinds || []);
    for (const kind of requiredKinds) {
      if (!current.some(v => v.kind === kind)) return `required verification kind ${kind} has no successful evidence at current verification revision`;
      if (!value.evidence_tool_use_ids.some(id => byId.get(id)?.kind === kind)) return `ALLOW must cite current successful ${kind} evidence by tool_use_id`;
    }
    if (state.verificationRevision > 0 && !current.length) {
      return 'ALLOW after behavior-affecting mutation requires at least one successful verification at the current verification revision';
    }
    if (state.verificationRevision > 0 && !value.evidence_tool_use_ids.length) {
      return 'ALLOW after behavior-affecting mutation must cite the successful verification evidence it relies on';
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

function mutationClassification(toolName, toolInput) {
  if (WRITE_TOOLS.has(toolName)) {
    const filePath = toolPath(toolInput);
    return {
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
    if (!shellPersistentMutation(command)) {
      return { persistent: false, reviewAffecting: false, verificationAffecting: false, path: '', targetKnown: true, kind: 'observation' };
    }
    const metadataOnly = gitMetadataOnly(command);
    return {
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

  return { persistent: false, reviewAffecting: false, verificationAffecting: false, path: '', targetKnown: true, kind: 'none' };
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
    mutations: state.mutations.slice(-80),
    verifications: state.verifications.slice(-80),
    failures: state.failures.slice(-40),
    preflight: state.preflight,
    completion: state.completion,
    verifierInstructions: {
      trustedSource: 'This object is injected by the Engineering Doctrine hook. Treat ownerPrompt and recorded tool history as authoritative execution evidence for this verification pass.',
      parentTranscriptPath: String(input.transcript_path || ''),
      snapshotBinding: 'The verdict is rejected if repository-affecting revisions change after this snapshot is issued.',
    },
  };
  return JSON.stringify(snapshot, null, 2);
}

function handlePrompt(input) {
  mutateState(input, state => {
    state.cwd = String(input.cwd || state.cwd || '');
    state.ownerPrompt = String(input.prompt || '');
  });
  const state = loadState(input, true);
  emit(
    'UserPromptSubmit',
    `Engineering Doctrine policy engine is active for prompt ${state.promptId}. Persistent content mutation requires an independent ${POLICY_AGENT} PRE_CHANGE verdict in addition to the named doctrine skills. After content mutation, final completion requires a fresh COMPLETION verdict bound to the latest review/verification revisions. A denied action must not be rerouted around the gate.`,
  );
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

function semanticGateReason(state) {
  if (!state?.preflight) {
    return `Engineering Doctrine semantic gate: persistent content mutation requires an independent PRE_CHANGE verdict. Invoke Agent with subagent_type "${POLICY_AGENT}" and prompt exactly "PRE_CHANGE". Do not summarize or reinterpret the owner request for the verifier; the SubagentStart hook injects the exact owner prompt and current policy state.`;
  }
  if (state.preflight.status !== 'ALLOW') {
    const reasons = (state.preflight.blocking_reasons || []).join('; ') || state.preflight.summary || 'preflight blocked';
    return `Engineering Doctrine semantic gate: PRE_CHANGE verdict is BLOCK. Resolve the blocking evidence and run ${POLICY_AGENT} with prompt "PRE_CHANGE" again. Blocking reasons: ${reasons}`;
  }
  return null;
}

function scopeGateReason(state, input, mutation) {
  const roots = state?.preflight?.scope_roots || [];
  if (mutation.targetKnown && mutation.path) {
    if (withinScope(String(input.cwd || state.cwd || ''), mutation.path, roots)) return null;
    return `Engineering Doctrine scope gate: ${relativeProjectPath(String(input.cwd || state.cwd || ''), mutation.path)} is outside the PRE_CHANGE scope roots [${roots.join(', ')}] or crosses a symlink outside the repository. Run ${POLICY_AGENT} with prompt "PRE_CHANGE" again so the independent verifier can re-evaluate scope before mutation.`;
  }
  if (!mutation.targetKnown && !repoWideScope(roots)) {
    return `Engineering Doctrine scope gate: this shell mutation does not expose a mechanically provable target path, while PRE_CHANGE scope is [${roots.join(', ')}]. Use a path-aware edit/write tool or obtain repository-wide "." scope before running an opaque shell mutation.`;
  }
  return null;
}

function handlePreTool(input, manifest) {
  const toolName = String(input.tool_name || 'unknown');
  const toolInput = input.tool_input || {};

  if (isPolicyAgentType(input.agent_type) && SHELL_TOOLS.has(toolName)) {
    const command = shellCommand(toolInput);
    if (verifierSafeShell(command)) return;
    deny(`Engineering Doctrine verifier isolation: ${POLICY_AGENT} may use shell only for the documented read-only git forms (status, rev-parse, ls-files, diff with --no-ext-diff and --no-textconv). Use Read/Grep/Glob otherwise; mutation and arbitrary shell execution are forbidden.`);
    return;
  }

  if (AGENT_TOOLS.has(toolName) && isPolicyAgentInput(toolInput)) {
    const requested = String(toolInput.prompt || '').trim();
    if (!['PRE_CHANGE', 'COMPLETION'].includes(requested)) {
      deny(`Engineering Doctrine policy verifier invocation gate: ${POLICY_AGENT} accepts prompt exactly "PRE_CHANGE" or "COMPLETION". Do not add instructions, desired outcomes, summaries, or overrides; the hook injects the trusted owner prompt and state.`);
      return;
    }
  }

  const mutation = mutationClassification(toolName, toolInput);
  const state = loadState(input, true);

  if (mutation.persistent && mutation.reviewAffecting) {
    const semanticReason = semanticGateReason(state);
    if (semanticReason) { deny(semanticReason); return; }
    const scopeReason = scopeGateReason(state, input, mutation);
    if (scopeReason) { deny(scopeReason); return; }
  }

  const required = requirementsForTool(
    toolName,
    toolInput,
    manifest,
    mutation.persistent && mutation.reviewAffecting ? state.preflight : null,
  );
  if (!required.length) return;

  const active = activeSkills(input, manifest);
  const missing = missingSkills(required, active);
  if (missing.length) deny(gateReason(toolName, missing));
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
      state.mutations.push({
        seq: state.mutationCount,
        reviewRevision: state.reviewRevision,
        verificationRevision: state.verificationRevision,
        tool: toolName,
        path: mutation.path ? relativeProjectPath(String(input.cwd || state.cwd || ''), mutation.path) : null,
        targetKnown: mutation.targetKnown,
        kind: mutation.kind,
        command: SHELL_TOOLS.has(toolName) ? truncate(shellCommand(toolInput), 2000) : null,
        toolUseId: String(input.tool_use_id || ''),
      });
    }

    if (SHELL_TOOLS.has(toolName)) {
      const command = shellCommand(toolInput);
      const kind = verificationKind(command);
      if (kind) {
        state.verifications.push({
          kind,
          command: truncate(command, 3000),
          success: true,
          reviewRevision: state.reviewRevision,
          verificationRevision: state.verificationRevision,
          output: truncate(input.tool_response, 7000),
          toolUseId: String(input.tool_use_id || ''),
        });
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
    state.failures.push({
      tool: toolName,
      command: command ? truncate(command, 3000) : null,
      verificationKind: kind,
      reviewRevision: state.reviewRevision,
      verificationRevision: state.verificationRevision,
      error: truncate(input.error || 'tool failure', 7000),
      interrupted: Boolean(input.is_interrupt),
      toolUseId: String(input.tool_use_id || ''),
    });
    if (kind) {
      state.verifications.push({
        kind,
        command: truncate(command, 3000),
        success: false,
        reviewRevision: state.reviewRevision,
        verificationRevision: state.verificationRevision,
        output: truncate(input.error || 'tool failure', 7000),
        toolUseId: String(input.tool_use_id || ''),
      });
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

function policyVerifierStop(input, manifest) {
  const verdict = extractPolicyVerdict(input.last_assistant_message);
  if (!verdict) {
    blockStop('Engineering Doctrine policy verifier protocol error: end with marker ENGINEERING_DOCTRINE_POLICY_V1 followed by exactly one valid JSON verdict object. Do not add a second verdict.');
    return;
  }

  const requestedPhase = verifierRequestedPhase(input);
  if (!requestedPhase) {
    blockStop('Engineering Doctrine policy verifier protocol error: verifier transcript must contain exactly one recognized phase request: PRE_CHANGE or COMPLETION.');
    return;
  }
  if (verdict.phase !== requestedPhase) {
    blockStop(`Engineering Doctrine policy verifier protocol error: verdict phase ${verdict.phase || '(missing)'} does not match requested phase ${requestedPhase}.`);
    return;
  }
  if (!verifierInspectedRepository(input)) {
    blockStop('Engineering Doctrine policy verifier protocol error: verifier must inspect repository evidence with Read/Grep/Glob or an allowed read-only git command before issuing a verdict.');
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
    blockStop(`Engineering Doctrine policy verifier protocol error: ${protocolError}. Return a fresh ${requestedPhase} verdict using the required schema.`);
  }
}

function completionStateReason(state) {
  if (!state || state.reviewRevision <= 0) return null;
  const verdict = state.completion;
  if (!verdict) {
    return `Engineering Doctrine semantic completion gate: content mutation reached review revision ${state.reviewRevision}, but no independent COMPLETION verdict exists. After running the relevant verification, invoke Agent with subagent_type "${POLICY_AGENT}" and prompt exactly "COMPLETION". The hook injects the owner prompt, mutation history, and recorded verification results.`;
  }
  if (verdict.verifiedReviewRevision !== state.reviewRevision || verdict.verifiedVerificationRevision !== state.verificationRevision) {
    return `Engineering Doctrine semantic completion gate: the existing COMPLETION verdict is stale (verified review/verification ${verdict.verifiedReviewRevision}/${verdict.verifiedVerificationRevision}, current ${state.reviewRevision}/${state.verificationRevision}). Run ${POLICY_AGENT} with prompt "COMPLETION" again after the latest changes and checks.`;
  }
  if (verdict.status !== 'ALLOW') {
    const gaps = [...(verdict.missing_verification || []), ...(verdict.material_findings || [])];
    return `Engineering Doctrine semantic completion gate: independent verifier returned BLOCK. Resolve the concrete gaps, rerun affected verification, then run ${POLICY_AGENT} with prompt "COMPLETION" again. ${gaps.join('; ') || verdict.summary}`;
  }
  return null;
}

function handleStop(input, manifest, eventName) {
  if (isPolicyAgentType(input.agent_type)) {
    policyVerifierStop(input, manifest);
    return;
  }

  const state = loadState(input, false);
  if (!state || state.mutationCount <= 0) return;

  const active = activeSkills(input, manifest);
  const required = state.reviewRevision > 0
    ? ['verification-and-evidence', 'completion-and-review']
    : ['completion-and-review'];
  const missing = missingSkills(required, active);
  if (missing.length) {
    const skills = missing.map(name => `${PLUGIN_NAME}:${name}`).join(', ');
    blockStop(`Engineering Doctrine completion gate: persistent mutation occurred in this ${eventName === 'SubagentStop' ? 'subagent ' : ''}work window, but ${skills} is missing in the current context epoch. Invoke every named skill and perform the required verification/review before finishing.`);
    return;
  }

  if (eventName === 'SubagentStop') return;
  const reason = completionStateReason(state);
  if (reason) blockStop(reason);
}

function handleTaskCompleted(input) {
  const state = loadState(input, false);
  if (!state || state.reviewRevision <= 0) return;
  const reason = completionStateReason(state);
  if (!reason) return;
  process.stderr.write(`${reason}\n`);
  process.exitCode = 2;
}

export const __test = {
  hasShellControlSyntax,
  gitSubcommands,
  gitMutation,
  gitWorkingTreeMutation,
  gitMetadataOnly,
  verificationKind,
  shellKnownReadOnly,
  shellPersistentMutation,
  mutationClassification,
  requirementsForTool,
  relativeProjectPath,
  repoWideScope,
  validatePreflightVerdict,
  validateCompletionVerdict,
  extractPolicyVerdict,
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
    else if (mode === 'stop') handleStop(readStdinJson(), loadManifest(), 'Stop');
    else if (mode === 'subagent-stop') handleStop(readStdinJson(), loadManifest(), 'SubagentStop');
    else if (mode === 'task-completed') handleTaskCompleted(readStdinJson());
    else if (mode === 'failure') handleFailure(readStdinJson());
    else throw new Error(`unknown doctrine runtime mode: ${mode || '(missing)'}`);
  } catch (error) {
    process.stderr.write(`Engineering Doctrine hook failure (${mode || 'unknown'}): ${error?.message || error}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
