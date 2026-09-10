import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { __test } from '../scripts/doctrine-runtime.mjs';

const {
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
  repoWideScope,
  validatePreflightVerdict,
  validateCompletionVerdict,
  extractPolicyVerdict,
} = __test;

test('compound shell syntax is never trusted as verification or read-only', () => {
  for (const command of [
    'pytest || true',
    'pytest; python -c "open(\'x\',\'w\').write(\'x\')"',
    'git status && git reset --hard HEAD',
    'git status | cat',
  ]) {
    assert.equal(hasShellControlSyntax(command), true);
    assert.equal(verificationKind(command), null);
    assert.equal(shellKnownReadOnly(command), false);
    assert.equal(shellPersistentMutation(command), true);
  }
});

test('compound git working-tree mutation cannot be downgraded to metadata-only', () => {
  const command = 'git status && git reset --hard HEAD';
  assert.deepEqual(gitSubcommands(command), ['status', 'reset']);
  assert.equal(gitMutation(command), true);
  assert.equal(gitWorkingTreeMutation(command), true);
  assert.equal(gitMetadataOnly(command), false);
  const classified = mutationClassification('Bash', { command });
  assert.equal(classified.persistent, true);
  assert.equal(classified.reviewAffecting, true);
  assert.equal(classified.verificationAffecting, true);
  assert.equal(classified.targetKnown, false);
  assert.equal(classified.kind, 'vcs-working-tree');
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
});

test('standalone verification is recognized but mutation-flavored verification is not', () => {
  assert.equal(verificationKind('pytest tests/test_auth.py'), 'test');
  assert.equal(verificationKind('npm run lint'), 'lint');
  assert.equal(verificationKind('tsc --noEmit'), 'typecheck');
  assert.equal(verificationKind('npm run build'), 'build');
  assert.equal(verificationKind('eslint . --fix'), null);
  assert.equal(verificationKind('jest -u'), null);
  assert.equal(shellPersistentMutation('eslint . --fix'), true);
  assert.equal(shellPersistentMutation('jest -u'), true);
});

test('opaque shell mutations require repository-wide scope at the policy layer', () => {
  assert.equal(repoWideScope(['src/auth']), false);
  assert.equal(repoWideScope(['.']), true);
  assert.equal(repoWideScope(['src', '.']), true);
});

test('preflight schema rejects traversal and unknown skills', () => {
  const manifest = { names: ['change-governance', 'implementation', 'verification-and-evidence'] };
  const base = {
    phase: 'PRE_CHANGE',
    status: 'ALLOW',
    mode: 'NORMAL_DEVELOPMENT',
    migration: false,
    confidence: 'high',
    scope_roots: ['src'],
    architecture_reasons: [],
    blocking_reasons: [],
    required_skills: [],
    required_verification_kinds: ['test'],
    summary: 'ok',
  };
  assert.equal(validatePreflightVerdict(base, manifest), null);
  assert.match(validatePreflightVerdict({ ...base, scope_roots: ['../src'] }, manifest), /scope_roots/);
  assert.match(validatePreflightVerdict({ ...base, required_skills: ['invented'] }, manifest), /unknown skill/);
});

test('completion requires current successful cited evidence', () => {
  const state = {
    verificationRevision: 2,
    preflight: { required_verification_kinds: ['test'] },
    verifications: [
      { kind: 'test', success: true, verificationRevision: 1, toolUseId: 'old' },
      { kind: 'test', success: true, verificationRevision: 2, toolUseId: 'new' },
    ],
  };
  const allow = {
    phase: 'COMPLETION',
    status: 'ALLOW',
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
  assert.equal(validateCompletionVerdict(allow, state), null);
  assert.match(validateCompletionVerdict({ ...allow, evidence_tool_use_ids: ['old'] }, state), /stale/);
});

test('policy verdict extraction ignores braces inside JSON strings', () => {
  const value = extractPolicyVerdict('prefix ENGINEERING_DOCTRINE_POLICY_V1\n{"phase":"PRE_CHANGE","summary":"{ok}"}\n');
  assert.deepEqual(value, { phase: 'PRE_CHANGE', summary: '{ok}' });
});


test('1.0.0 semantic policy surface remains canonical and generated', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../plugin/doctrine/projection-map.json', import.meta.url), 'utf8'));
  for (const name of ['change-governance', 'agentic-execution', 'persistent-knowledge']) {
    assert.ok(manifest.skills[name], `missing canonical skill ${name}`);
  }
  assert.equal(manifest.skills['mutation-safety'], undefined);

  for (const condition of ['architecture-bootstrap', 'architecture-change', 'architecture-migration', 'agentic-execution', 'persistent-knowledge']) {
    assert.ok(manifest.taxonomy.conditions[condition], `missing canonical condition ${condition}`);
  }

  const ids = new Set(manifest.rules.map(rule => rule.id));
  for (const id of ['architecture.mode-routing', 'architecture.bootstrap', 'architecture.change', 'architecture.migration', 'agentic.execution', 'knowledge.derived']) {
    assert.ok(ids.has(id), `missing canonical rule ${id}`);
  }
});

test('Agent hard gates preserve policy and multi-agent semantics', () => {
  const manifest = { names: ['change-governance', 'agentic-execution'] };
  assert.deepEqual(
    requirementsForTool('Agent', { subagent_type: 'worker' }, manifest),
    ['agentic-execution'],
  );
  assert.deepEqual(
    requirementsForTool('Agent', { subagent_type: 'engineering-doctrine:doctrine-policy-verifier' }, manifest),
    ['change-governance'],
  );
});
