import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_NAME = 'engineering-doctrine';
const ROUTING_SKILL = `${PLUGIN_NAME}:routing`;
const REVIEWER_AGENT_SUFFIX = 'doctrine-reviewer';
const STATE_VERSION = 1;
const STATE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(runtimeDir, '..');
const manifestPath = path.join(pluginRoot, 'doctrine', 'projection-map.json');
const dataRoot = process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'engineering-doctrine-plugin-data');
const stateRoot = path.join(dataRoot, `routing-v${STATE_VERSION}`);

function readStdinJson() {
  const raw = fs.readFileSync(0, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function emit(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function deny(reason) {
  emit({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  });
}

function readManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function signalCatalog(manifest) {
  const out = [];
  for (const [kind, registryName] of [['stage', 'stages'], ['surface', 'surfaces'], ['condition', 'conditions']]) {
    for (const [value, item] of Object.entries(manifest.taxonomy[registryName])) {
      out.push({ signal: `${kind}:${value}`, kind, when: item.when });
    }
  }
  return out;
}

function routeTable(manifest) {
  const table = new Map();
  for (const [skill, spec] of Object.entries(manifest.taxonomy.skillCatalog)) {
    for (const route of spec.routes) {
      table.set(route.signal, { skill: `${PLUGIN_NAME}:${skill}`, skillName: skill, reference: route.reference });
    }
  }
  return table;
}

function normalizeArgs(toolInput = {}) {
  const raw = toolInput.args ?? toolInput.arguments ?? '';
  if (Array.isArray(raw)) return raw.join(' ').trim();
  if (raw == null) return '';
  return String(raw).trim();
}

function invokedSkill(toolInput = {}) {
  return String(toolInput.skill ?? toolInput.name ?? '').trim();
}

function parseRoute(raw, manifest) {
  const text = String(raw ?? '').trim();
  if (!text) return { bootstrap: true, diagnose: false, none: false, signals: [] };
  if (text === 'diagnose') return { bootstrap: false, diagnose: true, none: false, signals: [] };
  if (text === 'none') return { bootstrap: false, diagnose: false, none: true, signals: [] };
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  const allowed = new Set(signalCatalog(manifest).map(x => x.signal));
  const seen = new Set();
  for (const token of tokens) {
    if (!allowed.has(token)) throw new Error(`unknown routing signal ${token}`);
    if (seen.has(token)) throw new Error(`duplicate routing signal ${token}`);
    seen.add(token);
  }
  const stages = tokens.filter(x => x.startsWith('stage:'));
  if (stages.length !== 1) throw new Error(`route must declare exactly one stage:* signal; received ${stages.length}`);
  return { bootstrap: false, diagnose: false, none: false, signals: tokens };
}

function routePlan(parsed, manifest) {
  if (parsed.none || parsed.diagnose) return { requiredSkills: [], requiredReferences: [] };
  const table = routeTable(manifest);
  const requiredSkills = new Set();
  const refs = new Map();
  for (const signal of parsed.signals) {
    const route = table.get(signal);
    if (!route) throw new Error(`no generated route for ${signal}`);
    requiredSkills.add(route.skill);
    if (route.reference) {
      const absolutePath = path.resolve(pluginRoot, 'skills', route.skillName, route.reference);
      refs.set(absolutePath, { signal, skill: route.skill, file: route.reference, absolutePath });
    }
  }
  return { requiredSkills: [...requiredSkills].sort(), requiredReferences: [...refs.values()].sort((a, b) => a.absolutePath.localeCompare(b.absolutePath)) };
}

function safeKey(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 40);
}

function scopeId(input) {
  return `${input.session_id || 'session'}|${input.agent_id || 'main'}`;
}

function pointerPath(input) {
  return path.join(stateRoot, 'current', `${safeKey(scopeId(input))}.json`);
}

function setCurrentEpoch(input, epoch) {
  fs.mkdirSync(path.dirname(pointerPath(input)), { recursive: true });
  atomicWriteJson(pointerPath(input), { epoch, updatedAt: Date.now() });
}

function currentEpoch(input) {
  if (input.prompt_id) return String(input.prompt_id);
  try {
    return JSON.parse(fs.readFileSync(pointerPath(input), 'utf8')).epoch;
  } catch {
    return null;
  }
}

function routeDir(input) {
  const epoch = currentEpoch(input);
  if (!epoch) return null;
  return path.join(stateRoot, 'scopes', safeKey(`${scopeId(input)}|${epoch}`));
}

function atomicWriteJson(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temp = `${target}.${process.pid}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value)}\n`, 'utf8');
  fs.renameSync(temp, target);
}

function markerPath(dir, kind, value) {
  return path.join(dir, kind, safeKey(value));
}

function mark(dir, kind, value) {
  fs.mkdirSync(path.join(dir, kind), { recursive: true });
  const target = markerPath(dir, kind, value);
  try {
    fs.writeFileSync(target, `${value}\n`, { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
  }
}

function isMarked(dir, kind, value) {
  return fs.existsSync(markerPath(dir, kind, value));
}

function samePath(left, right) {
  const a = path.resolve(String(left || ''));
  const b = path.resolve(String(right || ''));
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

function readRoute(dir) {
  if (!dir) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'route.json'), 'utf8'));
  } catch {
    return null;
  }
}

function snapshot(input) {
  const dir = routeDir(input);
  const route = readRoute(dir);
  if (!dir || !route) return { dir, route: null, missingSkills: [], missingReferences: [] };
  const missingSkills = (route.requiredSkills || []).filter(skill => !isMarked(dir, 'skills', skill));
  const missingReferences = (route.requiredReferences || []).filter(ref => !isMarked(dir, 'references', ref.absolutePath));
  return { dir, route, missingSkills, missingReferences };
}

function isReviewer(input) {
  const type = String(input.agent_type || '');
  return type === REVIEWER_AGENT_SUFFIX || type.endsWith(`:${REVIEWER_AGENT_SUFFIX}`);
}

function routingReminder() {
  return 'Engineering Doctrine §0.1 runtime checkpoint is active. Before any covered work in this prompt, invoke engineering-doctrine:routing. If the canonical signal IDs are not already known, invoke it once without arguments to load the routing catalog, then invoke it again with exactly one stage:* signal plus every applicable surface:* and condition:* signal. Load every skill and supporting reference required by the accepted route before other covered tool use. Re-route before the next covered action whenever stage, surface, or condition changes. If applicability is genuinely unknown, invoke it with diagnose to permit only minimal read-only diagnosis before declaring the full route. If this prompt has no Doctrine-covered work, invoke engineering-doctrine:routing with the single argument none.';
}

function catalogText(manifest) {
  const groups = [['Stages (choose exactly one)', 'stage'], ['Surfaces (include every applicable)', 'surface'], ['Conditions (include every applicable)', 'condition']];
  const catalog = signalCatalog(manifest);
  return groups.map(([title, kind]) => {
    const lines = catalog.filter(x => x.kind === kind).map(x => `- ${x.signal} — ${x.when}`);
    return `${title}:\n${lines.join('\n')}`;
  }).join('\n\n');
}

function formatRequirements(route) {
  if (route.none) return 'Route accepted: no Doctrine-covered work for this prompt.';
  if (route.diagnose) return 'Provisional diagnosis checkpoint accepted. Only minimal read-only diagnosis is permitted. Declare a full stage/surface/condition route before any other covered work.';
  const skills = route.requiredSkills.length ? route.requiredSkills.join(', ') : '(none)';
  const refs = route.requiredReferences.length
    ? route.requiredReferences.map(ref => `${ref.skill}/${ref.file} [${ref.signal}]`).join(', ')
    : '(none)';
  return `Route accepted for ${route.signals.join(' ')}. Required skills: ${skills}. Required supporting references: ${refs}. Load all of them before other covered tool use.`;
}

function initializePrompt(input) {
  const epoch = input.prompt_id ? String(input.prompt_id) : crypto.randomUUID();
  setCurrentEpoch(input, epoch);
  emit({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: routingReminder() } });
}

function initializeSubagent(input) {
  if (input.agent_id) setCurrentEpoch(input, input.prompt_id ? String(input.prompt_id) : crypto.randomUUID());
  const payload = JSON.parse(fs.readFileSync(path.join(runtimeDir, 'subagent-start.json'), 'utf8'));
  const existing = String(payload.hookSpecificOutput?.additionalContext || '');
  payload.hookSpecificOutput = {
    ...(payload.hookSpecificOutput || {}),
    hookEventName: 'SubagentStart',
    additionalContext: `${existing}\n\n${routingReminder()}`.trim(),
  };
  emit(payload);
}

function resetScope(input) {
  const pointer = pointerPath(input);
  try { fs.rmSync(pointer, { force: true }); } catch {}
}

function emitSessionContext(input) {
  resetScope(input);
  process.stdout.write(fs.readFileSync(path.join(runtimeDir, 'session-start.json'), 'utf8'));
}

function cleanupState() {
  const cutoff = Date.now() - STATE_RETENTION_MS;
  for (const branch of ['scopes', 'current']) {
    const root = path.join(stateRoot, branch);
    if (!fs.existsSync(root)) continue;
    for (const name of fs.readdirSync(root)) {
      const target = path.join(root, name);
      try {
        if (fs.statSync(target).mtimeMs < cutoff) fs.rmSync(target, { recursive: true, force: true });
      } catch {}
    }
  }
}

function handlePreTool(input) {
  if (isReviewer(input)) return;
  const manifest = readManifest();
  const toolName = String(input.tool_name || '');
  if (toolName === 'Skill') {
    const skill = invokedSkill(input.tool_input);
    if (skill === ROUTING_SKILL) {
      try {
        parseRoute(normalizeArgs(input.tool_input), manifest);
      } catch (error) {
        deny(`Engineering Doctrine §0.1 rejected the route declaration: ${error.message}. Invoke ${ROUTING_SKILL} without arguments for the canonical signal catalog, then declare the route again.`);
      }
      return;
    }
    const state = snapshot(input);
    if (!state.route) {
      deny(`Engineering Doctrine §0.1 routing must precede other skills. Invoke ${ROUTING_SKILL} before ${skill || 'this skill'}.`);
      return;
    }
    if (state.route.none) {
      deny(`Engineering Doctrine §0.1 route 'none' is invalidated by attempted skill use (${skill || 'unknown'}). Declare a full route before continuing.`);
      return;
    }
    if (state.route.diagnose) {
      deny(`Engineering Doctrine §0.1 provisional diagnosis permits only minimal read-only diagnosis. Declare the full route before invoking ${skill || 'another skill'}.`);
      return;
    }
    if (state.missingSkills.length) {
      if (state.missingSkills.includes(skill)) return;
      deny(`Engineering Doctrine §0.1 requires these routed skills first: ${state.missingSkills.join(', ')}. Do not invoke ${skill || 'another skill'} until the route requirements are satisfied.`);
      return;
    }
    if (state.missingReferences.length) {
      const refs = state.missingReferences.map(ref => `${ref.skill}/${ref.file} [${ref.signal}]`).join(', ');
      deny(`Engineering Doctrine §0.1 requires these supporting references before other skills: ${refs}.`);
    }
    return;
  }

  const state = snapshot(input);
  if (!state.route) {
    deny(`Engineering Doctrine §0.1 routing checkpoint is missing for this prompt. Invoke ${ROUTING_SKILL} before ${toolName}. Use no arguments first if you need the canonical signal catalog, or use the single argument none only when no Doctrine-covered work applies.`);
    return;
  }
  if (state.route.none) {
    deny(`Engineering Doctrine §0.1 route 'none' is invalidated by attempted tool use (${toolName}). Declare a full route with exactly one stage:* plus every applicable surface/condition before continuing.`);
    return;
  }
  if (state.route.diagnose) {
    if (['Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch'].includes(toolName)) return;
    deny(`Engineering Doctrine §0.1 is in provisional diagnosis mode. Only minimal read-only diagnosis is permitted before a full route; declare exactly one stage:* plus every applicable surface/condition before ${toolName}.`);
    return;
  }

  if ((toolName === 'Edit' || toolName === 'Write' || toolName === 'NotebookEdit') && !state.route.signals.includes('condition:mutation')) {
    deny(`Engineering Doctrine §0.1 requires re-routing before persistent mutation. Re-invoke ${ROUTING_SKILL} with the current stage plus condition:mutation and every other applicable surface/condition, then load any newly required skill/reference before ${toolName}.`);
    return;
  }

  if (toolName === 'Agent') {
    const agentType = String(input.tool_input?.subagent_type || '');
    if (agentType.endsWith(REVIEWER_AGENT_SUFFIX) && !state.route.signals.includes('stage:review')) {
      deny(`Engineering Doctrine §0.1 requires stage:review before invoking the doctrine reviewer. Re-invoke ${ROUTING_SKILL} with stage:review and every currently applicable surface/condition first.`);
      return;
    }
  }

  if (state.missingSkills.length) {
    deny(`Engineering Doctrine §0.1 route is incomplete. Load these required skills before ${toolName}: ${state.missingSkills.join(', ')}.`);
    return;
  }

  if (state.missingReferences.length) {
    if (toolName === 'Read') {
      const requested = String(input.tool_input?.file_path || '');
      if (state.missingReferences.some(ref => samePath(ref.absolutePath, requested))) return;
    }
    const refs = state.missingReferences.map(ref => `${ref.skill}/${ref.file} [${ref.signal}]`).join(', ');
    deny(`Engineering Doctrine §0.1 route is incomplete. Read these required supporting references with the Read tool before ${toolName}: ${refs}.`);
  }
}

function handlePostSkill(input) {
  if (isReviewer(input)) return;
  const skill = invokedSkill(input.tool_input);
  if (!skill) return;
  if (skill === ROUTING_SKILL) {
    let dir = routeDir(input);
    if (!dir) {
      const epoch = input.prompt_id ? String(input.prompt_id) : crypto.randomUUID();
      setCurrentEpoch(input, epoch);
      dir = routeDir(input);
    }
    const manifest = readManifest();
    const parsed = parseRoute(normalizeArgs(input.tool_input), manifest);
    if (parsed.bootstrap) {
      emit({
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: `Engineering Doctrine routing catalog:\n\n${catalogText(manifest)}\n\nNow invoke ${ROUTING_SKILL} again with exactly one stage:* signal plus every applicable surface:* and condition:* signal; use diagnose only for provisional minimal read-only diagnosis when applicability is genuinely unknown, or none if no Doctrine-covered work applies.`,
        },
      });
      return;
    }
    const plan = routePlan(parsed, manifest);
    const route = {
      version: STATE_VERSION,
      diagnose: parsed.diagnose,
      none: parsed.none,
      signals: parsed.signals,
      requiredSkills: plan.requiredSkills,
      requiredReferences: plan.requiredReferences,
      updatedAt: Date.now(),
    };
    atomicWriteJson(path.join(dir, 'route.json'), route);
    emit({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: formatRequirements(route) } });
    return;
  }
  const state = snapshot(input);
  if (state.route?.requiredSkills?.includes(skill)) mark(state.dir, 'skills', skill);
}

function handlePostRead(input) {
  if (isReviewer(input)) return;
  const state = snapshot(input);
  if (!state.route || state.route.none || state.route.diagnose) return;
  const requested = String(input.tool_input?.file_path || '');
  const required = (state.route.requiredReferences || []).find(ref => samePath(ref.absolutePath, requested));
  if (required) mark(state.dir, 'references', required.absolutePath);
}

function handleStop(input) {
  if (isReviewer(input)) return;
  const state = snapshot(input);
  if (state.route?.none) return;
  const reason = !state.route
    ? `Engineering Doctrine §0.1 routing was never established for this prompt. Invoke ${ROUTING_SKILL} before finishing; use diagnose only for temporary minimal read-only diagnosis and none only if no Doctrine-covered work applies.`
    : state.route.diagnose
      ? `Engineering Doctrine §0.1 remains in provisional diagnosis mode. Declare the full current stage/surface/condition route before finishing.`
      : state.missingSkills.length
        ? `Engineering Doctrine §0.1 route is incomplete. Load required skills before finishing: ${state.missingSkills.join(', ')}.`
        : state.missingReferences.length
          ? `Engineering Doctrine §0.1 route is incomplete. Read required supporting references before finishing: ${state.missingReferences.map(ref => `${ref.skill}/${ref.file}`).join(', ')}.`
          : null;
  if (!reason) return;
  if (input.stop_hook_active) {
    emit({ systemMessage: `${reason} The stop hook already retried once, so it is failing soft to avoid a loop; treat the turn as routing-incomplete.` });
    return;
  }
  emit({ decision: 'block', reason });
}

function selfTest() {
  const manifest = readManifest();
  const parsed = parseRoute('stage:implement condition:mutation', manifest);
  const plan = routePlan(parsed, manifest);
  if (!plan.requiredSkills.includes(`${PLUGIN_NAME}:implementation`)) throw new Error('implementation route missing');
  if (!plan.requiredSkills.includes(`${PLUGIN_NAME}:mutation-safety`)) throw new Error('mutation route missing');
  let rejected = false;
  try { parseRoute('condition:mutation', manifest); } catch { rejected = true; }
  if (!rejected) throw new Error('stage-less route accepted');
  if (!parseRoute('none', manifest).none) throw new Error('none route rejected');
  if (!parseRoute('diagnose', manifest).diagnose) throw new Error('diagnose route rejected');
  process.stdout.write('Doctrine runtime self-test passed\n');
}

const mode = process.argv[2];
try {
  if (mode === 'session-context') { const input = readStdinJson(); try { cleanupState(); } catch {} emitSessionContext(input); }
  else if (mode === 'subagent-context') initializeSubagent(readStdinJson());
  else if (mode === 'prompt') initializePrompt(readStdinJson());
  else if (mode === 'pre-tool') handlePreTool(readStdinJson());
  else if (mode === 'post-skill') handlePostSkill(readStdinJson());
  else if (mode === 'post-read') handlePostRead(readStdinJson());
  else if (mode === 'stop') handleStop(readStdinJson());
  else if (mode === 'self-test') selfTest();
  else throw new Error(`unknown doctrine runtime mode: ${mode || '(missing)'}`);
} catch (error) {
  const message = `Engineering Doctrine runtime failure (${mode || 'unknown'}): ${error?.message || error}`;
  if (mode === 'pre-tool') deny(`${message}. Tool execution is blocked because §0.1 routing state cannot be verified.`);
  else if (mode === 'stop') emit({ decision: 'block', reason: `${message}. Completion is blocked because §0.1 routing state cannot be verified.` });
  else if (mode === 'post-skill' || mode === 'post-read') emit({ decision: 'block', reason: message });
  else { process.stderr.write(`${message}\n`); process.exitCode = 1; }
}
