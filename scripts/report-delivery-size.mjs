import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plugin = path.join(root, 'plugin');
const manifest = JSON.parse(fs.readFileSync(path.join(plugin, 'doctrine/projection-map.json'), 'utf8'));
const bytes = file => Buffer.byteLength(fs.readFileSync(file));
let routerBytes = 0, ruleBytes = 0, maxRouter = 0, ruleFiles = 0;
const bySkill = [];
for (const [name, skill] of Object.entries(manifest.skills)) {
  const rootDir = path.join(plugin, 'skills', name);
  const size = bytes(path.join(rootDir, 'SKILL.md'));
  const ruleSize = skill.ruleIds.reduce((total, id) => {
    ruleFiles++;
    return total + bytes(path.join(rootDir, 'rules', `${id}.md`));
  }, 0);
  routerBytes += size;
  ruleBytes += ruleSize;
  maxRouter = Math.max(maxRouter, size);
  bySkill.push({ name, routerBytes: size, deferredRuleBytes: ruleSize });
}
const reviewerPreload = manifest.agent.preloadedSkills.map(x => {
  const name = x.replace(/^engineering-doctrine:/, '');
  return { name, bytes: bytes(path.join(plugin, 'skills', name, 'SKILL.md')) };
});
const report = {
  governingSessionChars: manifest.governing.sessionRuntimeJsonChars,
  governingSubagentChars: manifest.governing.subagentRuntimeJsonChars,
  reviewerPreloadedIndexes: reviewerPreload,
  totalSkillRouterBytes: routerBytes,
  totalDeferredRuleBytes: ruleBytes,
  maxRouterBytes: maxRouter,
  generatedRuleFiles: ruleFiles,
  perSkill: bySkill,
  measurement: 'static UTF-8 bytes and serialized JSON characters, not model token usage'
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--check')) {
  if (maxRouter > 6000 || reviewerPreload.length > 1 ||
      manifest.governing.sessionRuntimeJsonChars >= manifest.governing.maxHookJsonChars ||
      ruleFiles !== 80 || bySkill.length !== 14) {
    console.error('FAIL: delivery budget or rule coverage regression');
    process.exit(1);
  }
}
