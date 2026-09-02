import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_NAME = 'engineering-doctrine';
const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(runtimeDir, '..');
const doctrineSkillsRoot = path.join(pluginRoot, 'skills');

const MUTATION_SKILL = `${PLUGIN_NAME}:mutation-safety`;

const INITIAL_CHECKPOINT = `Engineering Doctrine §0.1 applies before the first substantive action on this prompt: judge the current stage and every applicable surface and condition, then ensure every matching skill and newly applicable supporting reference is in context. Persistent edits are gated: Edit, Write, and NotebookEdit are denied until ${MUTATION_SKILL} is in context.`;
const BATCH_CHECKPOINT = 'Engineering Doctrine §0.1 remains a semantic judgment by the active agent. In light of the tool results just received, reassess whether the current stage, surfaces, conditions, or intended next action changed, and load every doctrine reference that became applicable before continuing.';
const MUTATION_DENIAL = toolName => `Engineering Doctrine §0.1: ${toolName} performs a persistent mutation, so condition:mutation applies by definition rather than by judgment, and ${MUTATION_SKILL} is not in context. Invoke it with the Skill tool — together with every other skill matching the current stage, surfaces, and conditions — then retry this edit.`;
const FAILURE_CHECKPOINT = toolName => `The preceding ${toolName || 'tool'} attempt failed. Under Engineering Doctrine, failure is evidence rather than an automatic classification. Before repeating or working around it, reassess stage, surfaces, and conditions; condition:execution-friction or condition:evidence-conflict may now apply, but only if the current evidence supports them. Load newly applicable doctrine content before choosing the next approach.`;

function readStdinJson() {
  const raw = fs.readFileSync(0, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function emit(event, additionalContext) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: event,
      additionalContext,
    },
  })}\n`);
}

function emitStatic(name) {
  process.stdout.write(fs.readFileSync(path.join(runtimeDir, `${name}.json`), 'utf8'));
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function isDoctrineLoadingCall(call) {
  const toolName = String(call?.tool_name || '');
  const input = call?.tool_input || {};
  if (toolName === 'Skill') {
    return String(input.skill || input.name || '').startsWith(`${PLUGIN_NAME}:`);
  }
  if (toolName === 'Read') {
    const filePath = String(input.file_path || '');
    if (!filePath) return false;
    return isInside(doctrineSkillsRoot, path.resolve(filePath));
  }
  return false;
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

function invokesSkill(node, skill) {
  if (Array.isArray(node)) return node.some(item => invokesSkill(item, skill));
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'tool_use' && node.name === 'Skill') {
    const requested = node.input?.skill ?? node.input?.name;
    if (String(requested || '') === skill) return true;
  }
  return Object.values(node).some(value => invokesSkill(value, skill));
}

// The gate derives what is loaded from the session transcript rather than storing
// route state: doctrine keeps applicability with the agent, so nothing here may
// become a second classifier. Unreadable transcript cannot prove absence, so the
// gate opens and says so rather than blocking work it cannot judge.
function isSkillLoaded(transcriptPath, skill) {
  if (!transcriptPath) return { loaded: false, checked: false };
  let raw;
  try {
    raw = fs.readFileSync(transcriptPath, 'utf8');
  } catch {
    return { loaded: false, checked: false };
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let record;
    try {
      record = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (invokesSkill(record, skill)) return { loaded: true, checked: true };
  }
  return { loaded: false, checked: true };
}

function handleMutationGate(input) {
  const toolName = String(input.tool_name || 'This tool');
  const { loaded, checked } = isSkillLoaded(String(input.transcript_path || ''), MUTATION_SKILL);
  if (loaded) return;
  if (!checked) {
    process.stderr.write(`Engineering Doctrine: could not read the session transcript, so the ${MUTATION_SKILL} gate did not run for ${toolName}.\n`);
    return;
  }
  deny(MUTATION_DENIAL(toolName));
}

function handleBatch(input) {
  const calls = Array.isArray(input.tool_calls) ? input.tool_calls : [];
  if (calls.length && calls.every(isDoctrineLoadingCall)) return;
  emit('PostToolBatch', BATCH_CHECKPOINT);
}

const mode = process.argv[2];
try {
  if (mode === 'session-context') emitStatic('session-start');
  else if (mode === 'subagent-context') emitStatic('subagent-start');
  else if (mode === 'prompt') emit('UserPromptSubmit', INITIAL_CHECKPOINT);
  else if (mode === 'pre-mutation') handleMutationGate(readStdinJson());
  else if (mode === 'batch') handleBatch(readStdinJson());
  else if (mode === 'failure') {
    const input = readStdinJson();
    emit('PostToolUseFailure', FAILURE_CHECKPOINT(String(input.tool_name || 'tool')));
  } else throw new Error(`unknown doctrine runtime mode: ${mode || '(missing)'}`);
} catch (error) {
  process.stderr.write(`Engineering Doctrine attention hook failure (${mode || 'unknown'}): ${error?.message || error}\n`);
  process.exitCode = 1;
}
