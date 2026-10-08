import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'plugin/doctrine/projection-map.json'), 'utf8'));

test('every routed rule is reachable exactly once via a generated complete rule file', () => {
  const seen = new Set();
  for (const [name, skill] of Object.entries(manifest.skills)) {
    const directory = path.join(root, 'plugin/skills', name);
    const index = fs.readFileSync(path.join(directory, 'SKILL.md'), 'utf8');
    assert.match(index, /Loading contract:/, name);
    assert.ok(index.length < 5000, `${name} loads ${index.length} characters before rule selection`);
    for (const id of skill.ruleIds) {
      assert.ok(!seen.has(id), `duplicate delivered rule: ${id}`);
      seen.add(id);
      const target = path.join(directory, 'rules', `${id}.md`);
      const body = fs.readFileSync(target, 'utf8');
      assert.ok(body.length > 30, `empty rule body for ${id}`);
      assert.ok(index.includes(`rules/${id}.md`), `index omits ${id}`);
      assert.ok(!body.includes('<!-- doctrine-rule'), `raw source marker leaked into ${id}`);
    }
  }
  const routed = manifest.rules.filter(r => r.route.kind === 'skill').map(r => r.id);
  assert.deepEqual([...seen].sort(), routed.sort());
  assert.equal(seen.size, 80);
});

test('reviewer preloads a single slim index, not all skills', () => {
  const reviewer = fs.readFileSync(path.join(root, 'plugin/agents/doctrine-reviewer.md'), 'utf8');
  const frontmatter = reviewer.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter);
  const skillsSection = frontmatter[1].match(/skills:\n((?:  - [^\n]+\n?)+)/);
  assert.ok(skillsSection);
  const selected = skillsSection[1].trim().split('\n').map(line => line.trim().replace(/^- /, ''));
  assert.deepEqual(selected, ['engineering-doctrine:completion-and-review']);
  assert.deepEqual(manifest.agent.preloadedSkills, selected);
});

test('governing rules remain injected at session and subagent entry', () => {
  const session = JSON.parse(fs.readFileSync(path.join(root, 'plugin/runtime/session-start.json'), 'utf8'));
  const subagent = JSON.parse(fs.readFileSync(path.join(root, 'plugin/runtime/subagent-start.json'), 'utf8'));
  for (const p of [session, subagent]) {
    const body = p.hookSpecificOutput.additionalContext;
    assert.ok(body.includes('No hidden failures'));
    assert.ok(body.includes('A normative contract governs its assigned semantics'), 'delegated normative authority must remain visible');
    assert.ok(body.length > 1000);
  }
  assert.ok(manifest.governing.sessionRuntimeJsonChars < manifest.governing.maxHookJsonChars);
  assert.ok(manifest.governing.subagentRuntimeJsonChars < manifest.governing.maxHookJsonChars);
});
