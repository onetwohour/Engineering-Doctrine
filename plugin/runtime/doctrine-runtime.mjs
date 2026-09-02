import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_NAME = 'engineering-doctrine';
const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(runtimeDir, '..');
const doctrineSkillsRoot = path.join(pluginRoot, 'skills');

const INITIAL_CHECKPOINT = 'Engineering Doctrine §0.1 applies before the first substantive action on this prompt: judge the current stage and every applicable surface and condition, then ensure matching skills and newly applicable supporting references are in context. Existing doctrine content need not be re-invoked solely to prove routing.';
const BATCH_CHECKPOINT = 'Engineering Doctrine §0.1 remains a semantic judgment by the active agent. In light of the tool results just received, reassess whether the current stage, surfaces, conditions, or intended next action changed; load only doctrine content that became newly applicable before continuing.';
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
  else if (mode === 'batch') handleBatch(readStdinJson());
  else if (mode === 'failure') {
    const input = readStdinJson();
    emit('PostToolUseFailure', FAILURE_CHECKPOINT(String(input.tool_name || 'tool')));
  } else throw new Error(`unknown doctrine runtime mode: ${mode || '(missing)'}`);
} catch (error) {
  process.stderr.write(`Engineering Doctrine attention hook failure (${mode || 'unknown'}): ${error?.message || error}\n`);
  process.exitCode = 1;
}
