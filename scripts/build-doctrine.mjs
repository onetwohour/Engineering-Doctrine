import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const MAX_HOOK_JSON_CHARS = 9500;
export const MAX_SKILL_DESCRIPTION_CHARS = 768;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GENERATED_ROOTS = ['skills', 'agents', 'runtime', 'hooks', 'doctrine'];
const ROOT_RESERVED_PLUGIN_DIRS = ['skills', 'agents', 'runtime', 'hooks', 'commands'];
const ROOT_RESERVED_PLUGIN_FILES = ['.mcp.json', '.lsp.json'];
const MUTATION_FLOOR = { signal: 'condition:mutation', tools: ['Edit', 'Write', 'NotebookEdit'] };

const POLICY_RUNTIME = {
  schemaVersion: 2,
  stateProtocol: 5,
  policyProtocol: 1,
  policyAgent: 'doctrine-policy-verifier',
  executionAgent: 'doctrine-engineer',
  canonicalMutationSkill: 'change-governance',
  verificationKinds: ['test', 'lint', 'typecheck', 'build', 'static-analysis'],
  scope: {
    pathAwareWrites: 'compared with optional PRE_CHANGE literal prefixes for drift evidence',
    opaqueShellMutation: 'reported as scope-unknown when an optional PRE_CHANGE scope is narrower than repository-wide',
  },
  verification: {
    compoundShellCommands: 'never accepted as automatic verification evidence',
    mutationFlags: 'never accepted as automatic verification evidence',
    completionBinding: 'optional verifier evidence is bound to reviewRevision and verificationRevision',
  },
  state: {
    serialization: 'session-scoped lock plus atomic JSON replacement',
    verifierSnapshotBinding: true,
  },
};

function signal(applies) {
  if (applies.kind === 'always' || applies.kind === 'meta') return applies.kind;
  return `${applies.kind}:${applies.value}`;
}

function cleanRuleText(text) {
  return text
    .replace(/\n?<!-- doctrine-rule \{[^\n]+\} -->\n?/, '\n')
    .replace(/\n?<!-- doctrine-applicability\n[\s\S]*?\n-->\n?/, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';
}

function yaml(value) {
  return /[:#\n]|^[-?]|\s$/.test(value) ? JSON.stringify(value) : value;
}

function parseDoctrine(src) {
  const taxonomyMatch = src.match(/<!-- doctrine-applicability\n([\s\S]*?)\n-->/);
  if (!taxonomyMatch) throw new Error('missing doctrine-applicability');
  const tax = JSON.parse(taxonomyMatch[1]);
  if (tax.schemaVersion !== 4) throw new Error(`unsupported applicability schema ${tax.schemaVersion}`);
  if (!Array.isArray(tax.retiredRuleIds)) throw new Error('missing retiredRuleIds tombstone ledger');

  const retiredSeen = new Set();
  for (const id of tax.retiredRuleIds) {
    if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(id) || retiredSeen.has(id)) {
      throw new Error(`invalid/duplicate retired semantic id ${id}`);
    }
    retiredSeen.add(id);
  }

  for (const kind of ['stage', 'surface', 'condition']) {
    const registry = tax[`${kind}s`];
    if (!registry || typeof registry !== 'object' || Array.isArray(registry)) throw new Error(`missing ${kind} applicability registry`);
    for (const [value, item] of Object.entries(registry)) {
      if (!item || typeof item.when !== 'string' || !item.when.trim()) throw new Error(`${kind}:${value}: missing canonical when predicate`);
      if (typeof item.cue !== 'string' || !item.cue.trim()) throw new Error(`${kind}:${value}: missing discovery cue`);
      if (item.cue.length > 180) throw new Error(`${kind}:${value}: discovery cue too long`);
    }
  }

  if (!tax.skillCatalog || typeof tax.skillCatalog !== 'object' || Array.isArray(tax.skillCatalog) || !Object.keys(tax.skillCatalog).length) {
    throw new Error('missing skillCatalog');
  }

  const routeBySignal = new Map();
  for (const [name, spec] of Object.entries(tax.skillCatalog)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64 || /(anthropic|claude)/.test(name)) {
      throw new Error(`invalid skill name ${name}`);
    }
    if (!spec || typeof spec !== 'object' || Array.isArray(spec) || Object.keys(spec).sort().join(',') !== 'discoverySummary,moment,routes') {
      throw new Error(`${name}: skill spec must contain exactly moment, discoverySummary, and routes`);
    }
    for (const [field, min, max] of [['moment', 20, 80], ['discoverySummary', 40, 420]]) {
      const text = spec[field];
      if (typeof text !== 'string' || text.trim() !== text || text.length < min || text.length > max || /\n|<[^>]*>/.test(text)) {
        throw new Error(`${name}: invalid ${field}`);
      }
      if (/\b(?:I|we|you|your|our)\b/i.test(text)) throw new Error(`${name}: ${field} must stay third-person`);
      if (/\b(?:must|never|always)\b|\bdo not\b/i.test(text)) throw new Error(`${name}: ${field} may not state binding requirements`);
    }
    if (!Array.isArray(spec.routes) || !spec.routes.length) throw new Error(`${name}: missing routes`);
    for (let i = 0; i < spec.routes.length; i++) {
      const routeSignal = spec.routes[i];
      if (typeof routeSignal !== 'string') throw new Error(`${name}: route ${i} must be a signal string`);
      const split = routeSignal.indexOf(':');
      const kind = routeSignal.slice(0, split);
      const value = routeSignal.slice(split + 1);
      const registry = tax[`${kind}s`];
      if (split < 1 || !registry || !registry[value]) throw new Error(`${name}: unknown route signal ${routeSignal}`);
      if (routeBySignal.has(routeSignal)) throw new Error(`signal routed more than once: ${routeSignal}`);
      routeBySignal.set(routeSignal, { skill: name, priority: i });
    }
  }

  const markers = [...src.matchAll(/<!-- doctrine-rule (\{[^\n]+\}) -->/g)].map(match => ({ index: match.index, meta: JSON.parse(match[1]) }));
  if (!markers.length) throw new Error('no doctrine rules');

  const starts = [];
  const headings = [];
  for (let i = 0; i < markers.length; i++) {
    if (i === 0) {
      starts.push(0);
      const heading = src.slice(0, markers[i].index).match(/^#\s+(.+)$/m);
      if (!heading) throw new Error('canonical preamble heading missing');
      headings.push({ presentation: 'preamble', title: heading[1] });
      continue;
    }
    const allHeadings = [...src.slice(0, markers[i].index).matchAll(/^#{1,6}\s+(.+)$/gm)];
    const heading = allHeadings[allHeadings.length - 1];
    if (!heading) throw new Error(`${markers[i].meta.id}: heading missing`);
    if (!/^\s*$/.test(src.slice(heading.index + heading[0].length, markers[i].index))) {
      throw new Error(`${markers[i].meta.id}: doctrine-rule metadata must immediately follow its heading`);
    }
    const parsed = heading[1].match(/^(?:(\d+(?:\.\d+)?)\.?\s+)?(.+)$/);
    starts.push(heading.index);
    headings.push({ presentation: parsed[1] || null, title: parsed[2] });
  }

  const rules = [];
  for (let i = 0; i < markers.length; i++) {
    const end = i + 1 < starts.length ? starts[i + 1] : src.length;
    rules.push({ ...markers[i].meta, presentation: headings[i].presentation, title: headings[i].title, order: i, text: src.slice(starts[i], end) });
  }

  const seen = new Set();
  for (const rule of rules) {
    if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(rule.id) || seen.has(rule.id)) throw new Error(`invalid/duplicate semantic id ${rule.id}`);
    seen.add(rule.id);
    if (retiredSeen.has(rule.id)) throw new Error(`retired semantic id reused ${rule.id}`);
    if (!['invariant', 'binding', 'meta'].includes(rule.authority)) throw new Error(`${rule.id}: invalid authority`);
    if ((rule.authority === 'meta') !== (rule.applies.kind === 'meta')) throw new Error(`${rule.id}: meta authority and meta applicability must be paired`);
    const ruleSignal = signal(rule.applies);
    if (!['always', 'meta'].includes(ruleSignal)) {
      const registry = tax[`${rule.applies.kind}s`];
      if (!registry || !registry[rule.applies.value]) throw new Error(`${rule.id}: unknown applicability ${ruleSignal}`);
    }
  }

  const byId = new Map(rules.map(rule => [rule.id, rule]));
  for (const rule of rules) {
    rule.references = [...rule.text.matchAll(/\{\{rule:([a-z][a-z0-9]*(?:[.-][a-z0-9]+)*)\}\}/g)].map(match => match[1]);
    for (const id of rule.references) {
      const target = byId.get(id);
      if (!target) throw new Error(`${rule.id}: unknown semantic reference ${id}`);
      if (rule.applies.kind !== 'meta' && target.applies.kind === 'meta') throw new Error(`${rule.id}: executable rule references meta rule ${id}`);
      const sourceSignal = signal(rule.applies);
      const targetSignal = signal(target.applies);
      if (sourceSignal !== 'meta' && targetSignal !== 'always' && targetSignal !== sourceSignal) {
        throw new Error(`${rule.id}: cross-applicability reference ${id} (${sourceSignal} -> ${targetSignal})`);
      }
    }
  }

  for (const rule of rules) {
    if (/\{\{routing-table\}\}/.test(rule.text) && signal(rule.applies) !== 'always') {
      throw new Error(`${rule.id}: routing-table placeholder outside the always tier`);
    }
  }

  const usedSignals = new Set(rules.map(rule => signal(rule.applies)).filter(value => value !== 'always' && value !== 'meta'));
  for (const value of usedSignals) if (!routeBySignal.has(value)) throw new Error(`active applicability has no skill route: ${value}`);
  for (const value of routeBySignal.keys()) if (!usedSignals.has(value)) throw new Error(`skill route has no active doctrine rule: ${value}`);

  return { tax, rules, byId, routeBySignal };
}

function renderRuleBody(rule, byId) {
  return cleanRuleText(rule.text).replace(/\{\{rule:([a-z][a-z0-9]*(?:[.-][a-z0-9]+)*)\}\}/g, (_match, id) => `\`${byId.get(id).id}\``);
}

function renderRoutingTable(tax) {
  return 'Load before the first action of each moment:\n' + Object.entries(tax.skillCatalog)
    .map(([name, spec]) => `- ${spec.moment.replace(/[.;]+$/, '')} → ${name}`)
    .join('\n');
}

function renderGoverningRules(rules, byId, tax) {
  const index = `Every rule below always applies. Invariants (highest tier): ${rules.filter(rule => rule.authority === 'invariant').map(rule => rule.id).join(', ')}.\n\n`;
  let placed = 0;
  const body = rules.map(rule => renderRuleBody(rule, byId).trimEnd().replace(/\{\{routing-table\}\}/g, () => {
    placed++;
    return renderRoutingTable(tax);
  })).join('\n\n');
  if (placed !== 1) throw new Error(`governing rules must place {{routing-table}} exactly once, found ${placed}`);
  return `${index}${body}\n`;
}

function renderRules(rules, byId) {
  return rules.map(rule => renderRuleBody(rule, byId).trimEnd()).join('\n\n') + '\n';
}

function taxonomyEntry(tax, key) {
  const split = key.indexOf(':');
  if (split < 1) return null;
  const kind = key.slice(0, split);
  const value = key.slice(split + 1);
  const registry = tax[`${kind}s`];
  return registry && registry[value] || null;
}

function app(tax, key) {
  const value = taxonomyEntry(tax, key);
  return value && value.when;
}

function cue(tax, key) {
  const value = taxonomyEntry(tax, key);
  return value && value.cue;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function joinAlternatives(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}; or ${items[1]}`;
  return `${items.slice(0, -1).join('; ')}; or ${items[items.length - 1]}`;
}

function readRuntimeAgent(name) {
  return fs.readFileSync(path.join(ROOT, 'scripts', 'runtime-agents', `${name}.md`), 'utf8').trimEnd() + '\n';
}

function runtimeHook(mode) {
  return { type: 'command', command: 'node', args: ['${CLAUDE_PLUGIN_ROOT}/runtime/doctrine-runtime.mjs', mode], timeout: 5 };
}

function buildHookConfig() {
  return {
    description: 'Loads the governing kernel, routes applicable doctrine, records mutation and verification evidence, reports scope or policy observations, and supports optional independent semantic review.',
    hooks: {
      SessionStart: [{ matcher: 'startup|resume|clear|compact|fork', hooks: [runtimeHook('session-context')] }],
      SubagentStart: [{ matcher: '.*', hooks: [runtimeHook('subagent-context')] }],
      UserPromptSubmit: [{ hooks: [runtimeHook('prompt')] }],
      UserPromptExpansion: [{ hooks: [runtimeHook('skill-expansion')] }],
      PreToolUse: [{ matcher: 'Edit|Write|NotebookEdit|Bash|PowerShell|Agent', hooks: [runtimeHook('pre-tool')] }],
      PostToolUse: [{ matcher: 'Edit|Write|NotebookEdit|Bash|PowerShell|Skill|Agent', hooks: [runtimeHook('post-tool')] }],
      PostToolUseFailure: [{ matcher: '.*', hooks: [runtimeHook('failure')] }],
      SubagentStop: [{ matcher: '.*', hooks: [runtimeHook('subagent-stop')] }],
    },
  };
}

function compileDoctrine(src, runtimeSource) {
  const parsed = parseDoctrine(src);
  const files = new Map();
  const governing = [];
  const meta = [];
  const skills = new Map(Object.entries(parsed.tax.skillCatalog).map(([name, spec]) => [name, {
    name,
    moment: spec.moment,
    summary: spec.discoverySummary,
    routes: spec.routes,
    signals: new Map(spec.routes.map(route => [route, { key: route, rules: [] }])),
    rules: [],
  }]));

  for (const rule of parsed.rules) {
    const key = signal(rule.applies);
    if (key === 'always') { governing.push(rule); continue; }
    if (key === 'meta') { meta.push(rule); continue; }
    const route = parsed.routeBySignal.get(key);
    if (!route) throw new Error(`${rule.id}: no route for ${key}`);
    const skill = skills.get(route.skill);
    if (!skill) throw new Error(`${rule.id}: unknown skill ${route.skill}`);
    skill.rules.push(rule);
    const slot = skill.signals.get(key);
    if (!slot) throw new Error(`${route.skill}: missing catalog signal ${key}`);
    slot.rules.push(rule);
  }

  for (const skill of skills.values()) {
    if (!skill.rules.length) throw new Error(`empty skill ${skill.name}`);
    skill.rules.sort((a, b) => a.order - b.order);
    const labels = skill.routes.map(route => {
      const value = cue(parsed.tax, route);
      if (!value) throw new Error(`missing discovery cue ${route}`);
      return value.replace(/[.;]+$/, '');
    });
    skill.description = `${capitalize(joinAlternatives(labels))}. Read this doctrine BEFORE ${skill.moment.replace(/[.;]+$/, '')}.`;
    if (skill.description.length > MAX_SKILL_DESCRIPTION_CHARS) {
      throw new Error(`${skill.name}: generated description ${skill.description.length} > ${MAX_SKILL_DESCRIPTION_CHARS}`);
    }

    const body = [
      '---',
      `name: ${skill.name}`,
      `description: ${yaml(skill.description)}`,
      '---',
      '',
      '## Responsibility',
      '',
      skill.summary,
      '',
      'Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.',
      '',
    ];
    let current = null;
    for (const rule of skill.rules) {
      const key = signal(rule.applies);
      if (key !== current) {
        current = key;
        body.push(`**Cue: ${capitalize(cue(parsed.tax, key).replace(/[.;]+$/, ''))}.** Canonical trigger: ${app(parsed.tax, key).replace(/[.;]+$/, '')}.`, '');
      }
      body.push(renderRuleBody(rule, parsed.byId).trimEnd(), '');
    }
    files.set(`plugin/skills/${skill.name}/SKILL.md`, body.join('\n'));
  }

  const reviewRules = parsed.rules.filter(rule => signal(rule.applies) === 'stage:review');
  if (!reviewRules.length) throw new Error('missing review rules');
  const reviewerSkills = [...skills.keys()].map(name => `engineering-doctrine:${name}`);
  files.set('plugin/agents/doctrine-reviewer.md', [
    '---',
    `name: doctrine-reviewer`,
    `description: ${yaml(`Use when ${app(parsed.tax, 'stage:review').replace(/[.;]+$/, '')} and an independent read-only reviewer is useful.`)}`,
    'tools: Read, Grep, Glob',
    'model: inherit',
    'skills:',
    ...reviewerSkills.map(name => `  - ${name}`),
    '---',
    '',
    "The preloaded doctrine skills are generated from the same canonical authority and carry every rule's full text inline; nothing further needs to be read. Before judging the change, classify the concrete diff against the triggers stated in each skill and apply every rule whose trigger applies.",
    '',
    renderRules(reviewRules, parsed.byId).trimEnd(),
    '',
  ].join('\n'));
  files.set('plugin/agents/doctrine-engineer.md', readRuntimeAgent('doctrine-engineer'));
  files.set('plugin/agents/doctrine-policy-verifier.md', readRuntimeAgent('doctrine-policy-verifier'));

  const kernel = renderGoverningRules(governing, parsed.byId, parsed.tax);
  const runtimePayload = (event, extra = {}) => JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: kernel, ...extra } }) + '\n';
  const sessionRuntime = runtimePayload('SessionStart', { reloadSkills: true });
  const subagentRuntime = runtimePayload('SubagentStart');
  if (sessionRuntime.length >= MAX_HOOK_JSON_CHARS) throw new Error(`SessionStart governing payload ${sessionRuntime.length} >= ${MAX_HOOK_JSON_CHARS}`);
  if (subagentRuntime.length >= MAX_HOOK_JSON_CHARS) throw new Error(`SubagentStart governing payload ${subagentRuntime.length} >= ${MAX_HOOK_JSON_CHARS}`);
  files.set('plugin/runtime/session-start.json', sessionRuntime);
  files.set('plugin/runtime/subagent-start.json', subagentRuntime);

  if (typeof runtimeSource !== 'string' || !runtimeSource.trim()) throw new Error('missing doctrine runtime source');
  files.set('plugin/runtime/doctrine-runtime.mjs', runtimeSource.trimEnd() + '\n');
  files.set('plugin/hooks/hooks.json', JSON.stringify(buildHookConfig(), null, 2) + '\n');
  files.set('plugin/doctrine/policy-runtime.json', JSON.stringify(POLICY_RUNTIME, null, 2) + '\n');

  const ruleRoute = rule => {
    const key = signal(rule.applies);
    if (key === 'always') return { kind: 'governing' };
    if (key === 'meta') return { kind: 'meta' };
    const route = parsed.routeBySignal.get(key);
    return { kind: 'skill', skill: route.skill };
  };

  const manifest = {
    schemaVersion: 11,
    generated: true,
    packageRoot: 'plugin',
    canonicalRepositoryPath: 'doctrine/ENGINEERING_DOCTRINE.md',
    semanticIdentity: 'stable-rule-id',
    presentationNumbersAreIdentity: false,
    retiredRuleIds: parsed.tax.retiredRuleIds,
    taxonomy: parsed.tax,
    rules: parsed.rules.map(rule => ({
      id: rule.id,
      presentation: rule.presentation,
      title: rule.title,
      authority: rule.authority,
      applies: rule.applies,
      signal: signal(rule.applies),
      references: rule.references,
      route: ruleRoute(rule),
    })),
    governing: {
      maxHookJsonChars: MAX_HOOK_JSON_CHARS,
      sessionRuntimeJsonChars: sessionRuntime.length,
      subagentRuntimeJsonChars: subagentRuntime.length,
      ruleIds: governing.map(rule => rule.id),
    },
    skills: Object.fromEntries([...skills].map(([name, skill]) => [name, {
      moment: skill.moment,
      discoverySummary: skill.summary,
      description: skill.description,
      signals: skill.routes,
      ruleIds: skill.rules.map(rule => rule.id),
    }])),
    agent: {
      name: 'doctrine-reviewer',
      readOnlyTools: ['Read', 'Grep', 'Glob'],
      preloadedSkills: reviewerSkills,
      ruleIds: reviewRules.map(rule => rule.id),
    },
    attention: {
      protocolVersion: 1,
      role: 'attention-scheduler',
      classifier: 'active Claude agent',
      routeSource: 'taxonomy.skillCatalog',
      persistentRoutingState: false,
      classifies: false,
      routing: {
        scope: MUTATION_FLOOR.signal,
        tools: MUTATION_FLOOR.tools,
        recommends: `engineering-doctrine:${parsed.routeBySignal.get(MUTATION_FLOOR.signal).skill}`,
        evidence: 'session transcript',
      },
      reports: {
        source: 'session transcript',
        evidence: 'a skill counts as delivered when its discoverySummary appears in a transcript text block; an invocation alone does not',
        facts: ['doctrine skills whose rules were delivered', 'skills invoked without delivery', 'tools used in the batch', 'git subcommands seen'],
        suppressedWhenUnchanged: true,
        fallsBackToInvocation: 'when no delivery is detectable at all',
      },
      checkpoints: [
        { event: 'UserPromptSubmit', purpose: 'doctrine state plus the initial moment judgment' },
        { event: 'PreToolUse', purpose: 'skill routing, effect classification, and scope-drift observation' },
        { event: 'PostToolBatch', purpose: 'doctrine state after an acting batch, when it changed' },
        { event: 'PostToolUseFailure', purpose: 'failure-evidence applicability reassessment' },
      ],
      compactionRecovery: { event: 'SessionStart', reloadSkills: true },
    },
    hookTransport: {
      form: 'exec',
      executable: 'node',
      script: 'runtime/doctrine-runtime.mjs',
      pluginRootPlaceholder: true,
      runtimeDependency: 'Claude Code documented Node command-hook execution',
    },
    metaRuleIds: meta.map(rule => rule.id),
  };
  files.set('plugin/doctrine/projection-map.json', JSON.stringify(manifest, null, 2) + '\n');

  for (const [relative, content] of files) {
    if ((relative.startsWith('plugin/skills/') || relative.startsWith('plugin/agents/')) && (/<!-- GENERATED semantic projection/.test(content) || /<!-- d [a-z]/.test(content))) {
      throw new Error(`execution-facing markdown contains compiler provenance: ${relative}`);
    }
  }
  return { parsed, manifest, files };
}

function walk(dir, prefix = '') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(absolute, relative));
    else out.push(relative);
  }
  return out;
}

function read(relative) {
  const target = path.join(ROOT, ...relative.split('/'));
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
}

function assertPackageBoundary() {
  for (const name of ROOT_RESERVED_PLUGIN_DIRS) {
    if (fs.existsSync(path.join(ROOT, name))) throw new Error(`plugin component directory must live under plugin/: ${name}`);
  }
  for (const name of ROOT_RESERVED_PLUGIN_FILES) {
    if (fs.existsSync(path.join(ROOT, name))) throw new Error(`plugin component file must live under plugin/: ${name}`);
  }
  if (fs.existsSync(path.join(ROOT, '.claude-plugin'))) {
    throw new Error('the marketplace moved to onetwohour/claude-plugins; a second one here would collide with it under the same name');
  }

  const pluginRoot = path.join(ROOT, 'plugin');
  if (!fs.existsSync(pluginRoot)) throw new Error('missing plugin/');
  const allowedTop = new Set(['.claude-plugin', 'skills', 'agents', 'runtime', 'hooks', 'doctrine', 'settings.json']);
  for (const entry of fs.readdirSync(pluginRoot)) {
    if (!allowedTop.has(entry)) throw new Error(`unexpected plugin-root entry outside closed package allowlist: ${entry}`);
  }

  const metadataDir = path.join(pluginRoot, '.claude-plugin');
  const metadataEntries = fs.readdirSync(metadataDir);
  if (metadataEntries.length !== 1 || metadataEntries[0] !== 'plugin.json') throw new Error('plugin/.claude-plugin may contain only plugin.json');
  const packageManifest = JSON.parse(fs.readFileSync(path.join(metadataDir, 'plugin.json'), 'utf8'));
  const allowedManifestKeys = new Set(['$schema', 'name', 'displayName', 'description', 'author', 'repository', 'homepage', 'license', 'keywords', 'version']);
  for (const key of Object.keys(packageManifest)) {
    if (!allowedManifestKeys.has(key)) throw new Error(`plugin manifest may not define component authority: ${key}`);
  }
  if (packageManifest.name !== 'engineering-doctrine') throw new Error(`unexpected plugin name ${packageManifest.name}`);
}

function main() {
  assertPackageBoundary();
  const canonical = fs.readFileSync(path.join(ROOT, 'doctrine', 'ENGINEERING_DOCTRINE.md'), 'utf8');
  const runtimeSource = fs.readFileSync(path.join(ROOT, 'scripts', 'doctrine-runtime.mjs'), 'utf8');
  const compiled = compileDoctrine(canonical, runtimeSource);
  const check = process.argv.includes('--check');
  const expected = new Set(compiled.files.keys());

  if (check) {
    let failed = false;
    for (const [relative, content] of compiled.files) {
      if (read(relative) !== content) {
        console.error(`DRIFT ${relative}`);
        failed = true;
      }
    }
    const actual = [];
    for (const root of GENERATED_ROOTS) {
      for (const child of walk(path.join(ROOT, 'plugin', root))) actual.push(`plugin/${root}/${child}`);
    }
    for (const relative of actual) {
      if (!expected.has(relative)) {
        console.error(`UNEXPECTED ${relative}`);
        failed = true;
      }
    }
    for (const relative of expected) {
      if (!actual.includes(relative)) {
        console.error(`MISSING ${relative}`);
        failed = true;
      }
    }
    if (failed) process.exit(1);
    console.log(`Doctrine projections match canonical source; governing SessionStart payload ${compiled.manifest.governing.sessionRuntimeJsonChars} chars.`);
    return;
  }

  for (const root of GENERATED_ROOTS) fs.rmSync(path.join(ROOT, 'plugin', root), { recursive: true, force: true });
  for (const [relative, content] of compiled.files) {
    const target = path.join(ROOT, ...relative.split('/'));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  console.log(`Generated ${compiled.files.size} doctrine projection files; governing SessionStart payload ${compiled.manifest.governing.sessionRuntimeJsonChars} chars.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
