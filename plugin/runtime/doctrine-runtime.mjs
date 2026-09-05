import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLUGIN_NAME = 'engineering-doctrine';
const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(runtimeDir, '..');
const projectionMapPath = path.join(pluginRoot, 'doctrine', 'projection-map.json');

// Tools that only observe. A batch made of these alone changes no doctrine state worth reporting.
const OBSERVING_TOOLS = new Set(['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch', 'ToolSearch', 'Skill', 'ListAgents', 'TaskOutput']);
const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
// An unchanged state report is repeated after this many assistant turns so it never falls out of reach.
const REPEAT_AFTER_TURNS = 12;
const STATE_MARKER = 'doctrine-state=';

// The transcript is append-only: it records that a skill was invoked, never that its text is still
// in context. Compaction drops skill bodies and leaves those records behind, so every report built
// from it has to say so rather than let the list be read as proof of presence.
const PRESENCE_CAVEAT = 'That list proves invocation, not presence. Compaction discards a skill\'s text and leaves its invocation in the transcript, so a skill whose rules you cannot actually read in this context is NOT loaded, whatever this line names. Never act on a moment on the strength of this list: if its skill\'s rules are not in front of you, invoke it again first.';
const PRESENCE_CAVEAT_SHORT = 'Invocation, not presence: a skill whose rules are not readable in this context is NOT loaded, and re-invoking it is the only way to get them back.';
const UNREADABLE_STATE = 'The session transcript could not be read, so nothing is known here about which doctrine skills have been invoked. Assume none of them are in context and invoke this moment\'s skill before acting.';

const FAILURE_CHECKPOINT = toolName => `The preceding ${toolName || 'tool'} attempt failed. Under Engineering Doctrine, failure is evidence rather than an automatic classification. Before repeating or working around it, reassess which moment the next action enters; condition:execution-friction or condition:evidence-conflict may now apply, but only if the current evidence supports them. Load newly applicable doctrine content before choosing the next approach.`;
const MUTATION_DENIAL = (toolName, requires) => `Engineering Doctrine: ${toolName} performs a persistent mutation, so condition:mutation applies by definition rather than by judgment, and ${requires} is not in context. Invoke it with the Skill tool, together with the skill for any other moment this action enters (routing table in the doctrine kernel), then retry this edit.`;

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

function deny(reason) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  })}\n`);
}

// The compiled projection map is the one owner of the skill list and the mutation floor.
function loadManifest() {
  const manifest = JSON.parse(fs.readFileSync(projectionMapPath, 'utf8'));
  const names = Object.keys(manifest.skills || {});
  const floor = manifest.attention && manifest.attention.blocking;
  if (!names.length || !floor || typeof floor.requires !== 'string' || !Array.isArray(floor.tools)) {
    throw new Error('projection map lacks the skill catalog or the mutation floor');
  }
  const prefix = `${PLUGIN_NAME}:`;
  const floorSkill = floor.requires.startsWith(prefix) ? floor.requires.slice(prefix.length) : floor.requires;
  if (!names.includes(floorSkill)) throw new Error(`mutation floor names an unknown skill ${floor.requires}`);
  return { names, floorSkill, floorRequires: floor.requires, floorTools: floor.tools };
}

// Everything below derives from the session transcript on each call; the runtime keeps no state of
// its own, so nothing here can become a second classifier or drift from what actually happened.
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
      // A line still being written is not evidence either way.
    }
  }
  return records;
}

function collectSkillCalls(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) collectSkillCalls(item, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (node.type === 'tool_use' && node.name === 'Skill') {
    const requested = String((node.input && (node.input.skill ?? node.input.name)) || '');
    if (requested.startsWith(`${PLUGIN_NAME}:`)) out.add(requested.slice(PLUGIN_NAME.length + 1));
  }
  for (const value of Object.values(node)) collectSkillCalls(value, out);
}

function loadedSkills(records) {
  const loaded = new Set();
  for (const record of records) collectSkillCalls(record, loaded);
  return loaded;
}

function describeState(invoked, names, caveat) {
  const seen = names.filter(name => invoked.has(name));
  const never = names.filter(name => !invoked.has(name));
  return `Doctrine skills invoked at some point this session: ${seen.length ? seen.join(', ') : 'none'}. Never invoked: ${never.length ? never.join(', ') : 'none'}. ${caveat}`;
}

// The last batch report this runtime wrote, as recorded in the transcript, and how many assistant
// turns have happened since.
function lastBatchReport(records) {
  let signature = null;
  let turnsSince = 0;
  for (const record of records) {
    if (record && record.type === 'attachment' && record.attachment && record.attachment.hookEvent === 'PostToolBatch') {
      const stdout = String(record.attachment.stdout || '');
      const start = stdout.indexOf(STATE_MARKER);
      if (start >= 0) {
        const end = stdout.indexOf(']', start);
        signature = stdout.slice(start + STATE_MARKER.length, end < 0 ? undefined : end);
        turnsSince = 0;
        continue;
      }
    }
    if (signature !== null && record && record.type === 'assistant') turnsSince++;
  }
  return { signature, turnsSince };
}

function batchFacts(calls) {
  const counts = new Map();
  const git = new Set();
  let acted = false;
  for (const call of calls) {
    const tool = String((call && call.tool_name) || 'unknown');
    counts.set(tool, (counts.get(tool) || 0) + 1);
    if (!OBSERVING_TOOLS.has(tool)) acted = true;
    if (SHELL_TOOLS.has(tool)) {
      const command = String((call.tool_input && call.tool_input.command) || '');
      for (const match of command.matchAll(/(?:^|[\s;&|(])git\s+([a-z][a-z-]*)/g)) git.add(match[1]);
    }
  }
  return { counts, git: [...git].sort(), acted };
}

function handlePrompt(input, manifest) {
  const records = transcriptRecords(String(input.transcript_path || ''));
  const state = records ? describeState(loadedSkills(records), manifest.names, PRESENCE_CAVEAT) : UNREADABLE_STATE;
  emit('UserPromptSubmit', `${state} Before the first substantive action on this prompt, find the moment it enters in the routing table of the doctrine kernel and load that skill; a reply to the owner is covered work. ${manifest.floorTools.join(', ')} are denied until ${manifest.floorRequires} is loaded.`);
}

function handleMutationGate(input, manifest) {
  const toolName = String(input.tool_name || 'This tool');
  const records = transcriptRecords(String(input.transcript_path || ''));
  if (!records) {
    // Unreadable transcript cannot prove absence, so the gate opens and says so rather than blocking work it cannot judge.
    process.stderr.write(`Engineering Doctrine: could not read the session transcript, so the ${manifest.floorRequires} gate did not run for ${toolName}.\n`);
    return;
  }
  if (loadedSkills(records).has(manifest.floorSkill)) return;
  deny(MUTATION_DENIAL(toolName, manifest.floorRequires));
}

function handleBatch(input, manifest) {
  const calls = Array.isArray(input.tool_calls) ? input.tool_calls : [];
  const facts = batchFacts(calls);
  if (!facts.acted) return;
  const records = transcriptRecords(String(input.transcript_path || ''));
  const invoked = records ? loadedSkills(records) : new Set();
  const signature = `invoked=${manifest.names.filter(name => invoked.has(name)).join(',')};tools=${[...facts.counts.keys()].sort().join(',')};git=${facts.git.join(',')}`;
  if (records) {
    const last = lastBatchReport(records);
    if (last.signature === signature && last.turnsSince < REPEAT_AFTER_TURNS) return;
  }
  const tools = [...facts.counts].map(([tool, count]) => (count > 1 ? `${tool}×${count}` : tool)).join(', ');
  const git = facts.git.length ? ` Git: ${facts.git.join(', ')}.` : '';
  const state = records ? describeState(invoked, manifest.names, PRESENCE_CAVEAT_SHORT) : UNREADABLE_STATE;
  emit('PostToolBatch', `Tools this batch: ${tools}.${git} ${state} If the next action enters a different moment, load its skill first; the routing table is in the doctrine kernel. [${STATE_MARKER}${signature}]`);
}

const mode = process.argv[2];
try {
  if (mode === 'session-context') emitStatic('session-start');
  else if (mode === 'subagent-context') emitStatic('subagent-start');
  else if (mode === 'prompt') handlePrompt(readStdinJson(), loadManifest());
  else if (mode === 'pre-mutation') handleMutationGate(readStdinJson(), loadManifest());
  else if (mode === 'batch') handleBatch(readStdinJson(), loadManifest());
  else if (mode === 'failure') {
    const input = readStdinJson();
    emit('PostToolUseFailure', FAILURE_CHECKPOINT(String(input.tool_name || 'tool')));
  } else throw new Error(`unknown doctrine runtime mode: ${mode || '(missing)'}`);
} catch (error) {
  process.stderr.write(`Engineering Doctrine attention hook failure (${mode || 'unknown'}): ${error?.message || error}\n`);
  process.exitCode = 1;
}
