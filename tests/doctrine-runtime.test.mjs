import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { __test } from '../scripts/doctrine-runtime.mjs';

const {
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
  repoWideScope,
  validatePreflightVerdict,
  validateCompletionVerdict,
  extractPolicyVerdict,
  stateSnapshotForVerifier,
} = __test;

const runtimePath = fileURLToPath(new URL('../scripts/doctrine-runtime.mjs', import.meta.url));
const repoRoot = path.dirname(path.dirname(runtimePath));

function runRuntime(mode, input, stateDir) {
  return spawnSync(process.execPath, [runtimePath, mode], {
    cwd: repoRoot,
    env: { ...process.env, ENGINEERING_DOCTRINE_STATE_DIR: stateDir },
    input: `${JSON.stringify(input)}\n`,
    encoding: 'utf8',
  });
}

function tempStateDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'engineering-doctrine-test-'));
}

test('compound read-only shell stays read-only but is not automatic verification evidence', () => {
  for (const command of [
    'pytest || true',
    'git status | cat',
    'cd src && ls',
    'rg TODO . | head',
  ]) {
    assert.equal(hasShellControlSyntax(command), true);
    assert.equal(verificationKind(command), null);
    assert.equal(shellKnownReadOnly(command), true, command);
    assert.equal(shellEffect(command), 'READ_ONLY', command);
    assert.equal(shellPersistentMutation(command), false, command);
  }
});

test('compound git working-tree mutation remains a mutation', () => {
  const command = 'git status && git reset --hard HEAD';
  assert.deepEqual(gitSubcommands(command), ['status', 'reset']);
  assert.equal(gitMutation(command), true);
  assert.equal(gitWorkingTreeMutation(command), true);
  assert.equal(gitMetadataOnly(command), false);
  assert.equal(shellEffect(command), 'MUTATION');
  const classified = mutationClassification('Bash', { command });
  assert.equal(classified.effect, 'MUTATION');
  assert.equal(classified.persistent, true);
  assert.equal(classified.reviewAffecting, true);
  assert.equal(classified.verificationAffecting, true);
  assert.equal(classified.targetKnown, false);
  assert.equal(classified.kind, 'vcs-working-tree');
});

test('git global options including -C do not corrupt subcommand classification', () => {
  for (const command of [
    'git -C repo status',
    'git --no-pager -C repo diff --stat',
    'git -C repo -c color.ui=false status',
    'git --git-dir=.git --work-tree=. status',
  ]) {
    assert.equal(gitSubcommands(command).length, 1, command);
    assert.equal(shellKnownReadOnly(command), true, command);
    assert.equal(shellEffect(command), 'READ_ONLY', command);
    assert.equal(shellPersistentMutation(command), false, command);
  }
  assert.deepEqual(gitSubcommands('git -C repo rev-parse --show-toplevel'), ['rev-parse']);
  assert.deepEqual(gitSubcommands('git -C repo reset --hard HEAD'), ['reset']);
  assert.equal(shellEffect('git -C repo reset --hard HEAD'), 'MUTATION');
});

test('simple git metadata mutations remain distinct from content mutations', () => {
  for (const command of ['git add file.txt', 'git commit -m test', 'git branch topic', 'git tag v1']) {
    assert.equal(gitMutation(command), true);
    assert.equal(gitMetadataOnly(command), true);
    const classified = mutationClassification('Bash', { command });
    assert.equal(classified.persistent, true);
    assert.equal(classified.reviewAffecting, false);
    assert.equal(classified.verificationAffecting, false);
  }
  assert.equal(gitMetadataOnly('git add file.txt && git status'), true);
});

test('standalone verification is recognized but mutation-flavored verification is not', () => {
  assert.equal(verificationKind('pytest tests/test_auth.py'), 'test');
  assert.equal(verificationKind('npm run lint'), 'lint');
  assert.equal(verificationKind('tsc --noEmit'), 'typecheck');
  assert.equal(verificationKind('npm run build'), 'build');
  assert.equal(verificationKind('eslint . --fix'), null);
  assert.equal(verificationKind('jest -u'), null);
  assert.equal(shellEffect('eslint . --fix'), 'MUTATION');
  assert.equal(shellEffect('jest -u'), 'MUTATION');
});

test('unknown shell effects are not promoted to persistent mutation', () => {
  const command = 'new-inspection-cli examine repo';
  assert.equal(shellKnownReadOnly(command), false);
  assert.equal(shellEffect(command), 'UNKNOWN');
  assert.equal(shellPersistentMutation(command), false);
  const classified = mutationClassification('Bash', { command });
  assert.equal(classified.effect, 'UNKNOWN');
  assert.equal(classified.persistent, false);
  assert.equal(classified.kind, 'unknown-shell');
});

test('scope helper recognizes repository-wide scope', () => {
  assert.equal(repoWideScope(['src/auth']), false);
  assert.equal(repoWideScope(['.']), true);
  assert.equal(repoWideScope(['src', '.']), true);
});

test('preflight schema rejects traversal and unknown skills', () => {
  const manifest = { names: ['change-governance', 'implementation', 'verification-and-evidence'] };
  const base = {
    phase: 'PRE_CHANGE',
    status: 'PASS',
    mode: 'NORMAL_DEVELOPMENT',
    migration: false,
    confidence: 'high',
    scope_roots: ['src'],
    architecture_reasons: [],
    concerns: [],
    applicable_skills: [],
    recommended_verification_kinds: ['test'],
    summary: 'ok',
  };
  assert.equal(validatePreflightVerdict(base, manifest), null);
  assert.match(validatePreflightVerdict({ ...base, scope_roots: ['../src'] }, manifest), /scope_roots/);
  assert.match(validatePreflightVerdict({ ...base, applicable_skills: ['invented'] }, manifest), /unknown skill/);
  assert.match(validatePreflightVerdict({ ...base, status: 'CONCERNS' }, manifest), /requires at least one concrete concern/);
});

test('completion PASS requires current successful cited evidence', () => {
  const state = {
    verificationRevision: 2,
    preflight: { recommended_verification_kinds: ['test'] },
    verifications: [
      { kind: 'test', success: true, verificationRevision: 1, toolUseId: 'old' },
      { kind: 'test', success: true, verificationRevision: 2, toolUseId: 'new' },
    ],
  };
  const pass = {
    phase: 'COMPLETION',
    status: 'PASS',
    mode_consistent: true,
    scope_consistent: true,
    verification_adequate: true,
    review_adequate: true,
    claims_bounded: true,
    evidence_tool_use_ids: ['new'],
    missing_verification: [],
    material_findings: [],
    summary: 'done',
  };
  assert.equal(validateCompletionVerdict(pass, state), null);
  assert.match(validateCompletionVerdict({ ...pass, evidence_tool_use_ids: ['old'] }, state), /stale/);
});

test('policy verdict extraction ignores braces inside JSON strings', () => {
  const value = extractPolicyVerdict('prefix ENGINEERING_DOCTRINE_POLICY_V1\n{"phase":"PRE_CHANGE","summary":"{ok}"}\n');
  assert.deepEqual(value, { phase: 'PRE_CHANGE', summary: '{ok}' });
});

test('skill routing preserves policy and multi-agent semantics', () => {
  const manifest = { names: ['change-governance', 'agentic-execution'] };
  assert.deepEqual(
    applicableSkillsForTool('Agent', { subagent_type: 'worker' }, manifest),
    ['agentic-execution'],
  );
  assert.deepEqual(
    applicableSkillsForTool('Agent', { subagent_type: 'engineering-doctrine:doctrine-policy-verifier' }, manifest),
    [],
  );
});

test('PreToolUse never emits a permission denial, even without PRE_CHANGE', () => {
  const stateDir = tempStateDir();
  const result = runRuntime('pre-tool', {
    session_id: 's1',
    prompt_id: 'p1',
    cwd: repoRoot,
    tool_name: 'Edit',
    tool_use_id: 'edit-1',
    tool_input: { file_path: 'src/example.js', old_string: 'a', new_string: 'b' },
  }, stateDir);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.trim(), 'expected advisory context');
  const output = JSON.parse(result.stdout.trim());
  assert.equal(output.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(Object.hasOwn(output.hookSpecificOutput, 'permissionDecision'), false);
  assert.equal(Object.hasOwn(output.hookSpecificOutput, 'permissionDecisionReason'), false);
  assert.match(output.hookSpecificOutput.additionalContext, /Relevant doctrine skills/);
});

test('identical runtime notice is injected only once per context epoch', () => {
  const stateDir = tempStateDir();
  const input = {
    session_id: 's-dedupe',
    prompt_id: 'p-dedupe',
    cwd: repoRoot,
    tool_name: 'Edit',
    tool_use_id: 'edit-dedupe',
    tool_input: { file_path: 'src/example.js', old_string: 'a', new_string: 'b' },
  };
  const first = runRuntime('pre-tool', input, stateDir);
  const second = runRuntime('pre-tool', { ...input, tool_use_id: 'edit-dedupe-2' }, stateDir);
  assert.equal(first.status, 0, first.stderr);
  assert.ok(first.stdout.trim());
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, '');
});

test('git -C read-only command passes PreToolUse without false mutation advisory', () => {
  const stateDir = tempStateDir();
  const result = runRuntime('pre-tool', {
    session_id: 's2',
    prompt_id: 'p2',
    cwd: repoRoot,
    tool_name: 'Bash',
    tool_use_id: 'bash-1',
    tool_input: { command: 'git -C . status --short' },
  }, stateDir);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
});

test('Stop and TaskCompleted never block after mutation', () => {
  const stateDir = tempStateDir();
  const base = { session_id: 's3', prompt_id: 'p3', cwd: repoRoot };
  let result = runRuntime('prompt', { ...base, prompt: 'change a file' }, stateDir);
  assert.equal(result.status, 0, result.stderr);
  result = runRuntime('post-tool', {
    ...base,
    tool_name: 'Edit',
    tool_use_id: 'edit-2',
    tool_input: { file_path: 'src/example.js', old_string: 'a', new_string: 'b' },
    tool_response: 'ok',
  }, stateDir);
  assert.equal(result.status, 0, result.stderr);

  for (const mode of ['stop', 'task-completed']) {
    result = runRuntime(mode, base, stateDir);
    assert.equal(result.status, 0, `${mode}: ${result.stderr}`);
    assert.equal(result.stdout, '', mode);
    assert.doesNotMatch(result.stderr, /block|gate/i, mode);
  }
});

test('optional verifier snapshot is compact and bounded', () => {
  const huge = 'x'.repeat(10_000);
  const state = {
    protocolVersion: 5,
    policyProtocol: 1,
    sessionId: 's',
    promptId: 'p',
    cwd: repoRoot,
    ownerPrompt: 'inspect this change',
    mutationCount: 80,
    reviewRevision: 80,
    verificationRevision: 80,
    mutations: Array.from({ length: 80 }, (_, i) => ({ seq: i, reviewRevision: i, verificationRevision: i, tool: 'Bash', path: null, targetKnown: false, kind: 'shell-mutation', command: huge, toolUseId: `m${i}` })),
    verifications: Array.from({ length: 80 }, (_, i) => ({ kind: 'test', command: huge, success: true, reviewRevision: i, verificationRevision: i, output: huge, toolUseId: `v${i}` })),
    failures: Array.from({ length: 40 }, (_, i) => ({ tool: 'Bash', command: huge, verificationKind: 'test', reviewRevision: i, verificationRevision: i, error: huge, interrupted: false, toolUseId: `f${i}` })),
    advisories: [],
    preflight: null,
    completion: null,
  };
  const snapshot = stateSnapshotForVerifier(state, { transcript_path: '' });
  assert.ok(snapshot.length < 50_000, `snapshot too large: ${snapshot.length}`);
  const parsed = JSON.parse(snapshot);
  assert.equal(parsed.mutations.length, 12);
  assert.equal(parsed.verifications.length, 12);
  assert.equal(parsed.failures.length, 6);
});

test('1.0.1 generated policy surface has no runtime permission gate', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../plugin/doctrine/projection-map.json', import.meta.url), 'utf8'));
  const policy = JSON.parse(fs.readFileSync(new URL('../plugin/doctrine/policy-runtime.json', import.meta.url), 'utf8'));
  const hooks = JSON.parse(fs.readFileSync(new URL('../plugin/hooks/hooks.json', import.meta.url), 'utf8'));
  const plugin = JSON.parse(fs.readFileSync(new URL('../plugin/.claude-plugin/plugin.json', import.meta.url), 'utf8'));
  const verifier = fs.readFileSync(new URL('../plugin/agents/doctrine-policy-verifier.md', import.meta.url), 'utf8');

  assert.equal(plugin.version, '1.0.1');
  assert.equal(policy.enforcement, undefined);
  assert.ok(manifest.attention.routing);
  assert.equal(manifest.attention.blocking, undefined);
  assert.equal(manifest.attention.advisory, undefined);
  assert.equal(hooks.hooks.Stop, undefined);
  assert.equal(hooks.hooks.TaskCompleted, undefined);
  assert.equal(/^skills:/m.test(verifier), false, 'policy verifier must not preload the full doctrine skill set');

  for (const name of ['change-governance', 'agentic-execution', 'persistent-knowledge']) {
    assert.ok(manifest.skills[name], `missing canonical skill ${name}`);
  }
  const ids = new Set(manifest.rules.map(rule => rule.id));
  for (const id of ['architecture.mode-routing', 'architecture.bootstrap', 'architecture.change', 'architecture.migration', 'agentic.execution', 'knowledge.derived']) {
    assert.ok(ids.has(id), `missing canonical rule ${id}`);
  }
});
