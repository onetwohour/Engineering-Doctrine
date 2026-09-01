import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

export const MAX_HOOK_JSON_CHARS=9500;
export const MAX_SKILL_DESCRIPTION_CHARS=768;
function signal(applies){if(applies.kind==="always"||applies.kind==="meta")return applies.kind;return applies.kind+":"+applies.value;}

function cleanRuleText(text){return text.replace(/\n?<!-- doctrine-rule \{[^\n]+\} -->\n?/,"\n").replace(/\n?<!-- doctrine-applicability\n[\s\S]*?\n-->\n?/,"\n").replace(/\n{3,}/g,"\n\n").trimEnd()+"\n";}

function yaml(value){return /[:#\n]|^[-?]|\s$/.test(value)?JSON.stringify(value):value;}

function parseDoctrine(src){
  const taxMatch=src.match(/<!-- doctrine-applicability\n([\s\S]*?)\n-->/);if(!taxMatch)throw new Error("missing doctrine-applicability");
  const tax=JSON.parse(taxMatch[1]);if(tax.schemaVersion!==3)throw new Error("unsupported applicability schema "+tax.schemaVersion);
  if(!Array.isArray(tax.retiredRuleIds))throw new Error("missing retiredRuleIds tombstone ledger");
  const retiredSeen=new Set();for(const id of tax.retiredRuleIds){if(!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(id)||retiredSeen.has(id))throw new Error("invalid/duplicate retired semantic id "+id);retiredSeen.add(id);}
  for(const kind of ["stage","surface","condition"]){const reg=tax[kind+"s"];if(!reg||typeof reg!=="object"||Array.isArray(reg))throw new Error("missing "+kind+" applicability registry");for(const [value,item] of Object.entries(reg)){if(!item||typeof item.when!=="string"||!item.when.trim())throw new Error(kind+":"+value+": missing canonical when predicate");if(typeof item.cue!=="string"||!item.cue.trim())throw new Error(kind+":"+value+": missing discovery cue");if(item.cue.length>180)throw new Error(kind+":"+value+": discovery cue too long");}}
  if(!tax.skillCatalog||typeof tax.skillCatalog!=="object"||Array.isArray(tax.skillCatalog)||!Object.keys(tax.skillCatalog).length)throw new Error("missing skillCatalog");
  const routeBySignal=new Map();
  for(const [name,spec] of Object.entries(tax.skillCatalog)){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)||name.length>64||/(anthropic|claude)/.test(name))throw new Error("invalid skill name "+name);if(!spec||!["router","inline"].includes(spec.mode))throw new Error(name+": invalid skill mode");if(typeof spec.discoverySummary!=="string"||spec.discoverySummary.trim()!==spec.discoverySummary||spec.discoverySummary.length<40||spec.discoverySummary.length>420||/\n|<[^>]*>/.test(spec.discoverySummary))throw new Error(name+": invalid discovery summary");if(/\b(?:I|we|you|your|our)\b/i.test(spec.discoverySummary))throw new Error(name+": discovery summary must stay third-person");if(/\b(?:must|never|always)\b|\bdo not\b/i.test(spec.discoverySummary))throw new Error(name+": discovery summary may not state binding requirements");if(!Array.isArray(spec.routes)||!spec.routes.length)throw new Error(name+": missing routes");const refs=new Set();for(let i=0;i<spec.routes.length;i++){const route=spec.routes[i],keys=Object.keys(route).sort().join(",");if(keys!=="reference,signal")throw new Error(name+": route "+i+" must contain only signal and reference");const p=route.signal.indexOf(":"),kind=route.signal.slice(0,p),value=route.signal.slice(p+1),reg=tax[kind+"s"];if(p<1||!reg||!reg[value])throw new Error(name+": unknown route signal "+route.signal);if(routeBySignal.has(route.signal))throw new Error("signal routed more than once: "+route.signal);if(spec.mode==="inline"){if(route.reference!==null)throw new Error(name+": inline route must have null reference");}else{if(typeof route.reference!=="string"||!/^[a-z0-9][a-z0-9-]*\.md$/.test(route.reference))throw new Error(name+": invalid router reference "+route.reference);if(refs.has(route.reference))throw new Error(name+": duplicate router reference "+route.reference);refs.add(route.reference);}routeBySignal.set(route.signal,{skill:name,reference:route.reference,priority:i});}}
  const markers=[...src.matchAll(/<!-- doctrine-rule (\{[^\n]+\}) -->/g)].map(m=>({index:m.index,meta:JSON.parse(m[1])}));if(!markers.length)throw new Error("no doctrine rules");
  const starts=[],headings=[];
  for(let i=0;i<markers.length;i++){
    if(i===0){starts.push(0);const h=src.slice(0,markers[i].index).match(/^#\s+(.+)$/m);if(!h)throw new Error("canonical preamble heading missing");headings.push({presentation:"preamble",title:h[1]});continue;}
    const hs=[...src.slice(0,markers[i].index).matchAll(/^#{1,6}\s+(.+)$/gm)],h=hs[hs.length-1];if(!h)throw new Error(markers[i].meta.id+": heading missing");
    if(!/^\s*$/.test(src.slice(h.index+h[0].length,markers[i].index)))throw new Error(markers[i].meta.id+": doctrine-rule metadata must immediately follow its heading");
    const parsed=h[1].match(/^(?:(\d+(?:\.\d+)?)\.?\s+)?(.+)$/);starts.push(h.index);headings.push({presentation:parsed[1]||null,title:parsed[2]});
  }
  const rules=[];
  for(let i=0;i<markers.length;i++){const end=i+1<starts.length?starts[i+1]:src.length;rules.push({...markers[i].meta,presentation:headings[i].presentation,title:headings[i].title,order:i,text:src.slice(starts[i],end)});}
  const seen=new Set();
  for(const r of rules){
    if(!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(r.id)||seen.has(r.id))throw new Error("invalid/duplicate semantic id "+r.id);seen.add(r.id);
    if(retiredSeen.has(r.id))throw new Error("retired semantic id reused "+r.id);
    if(!["invariant","binding","meta"].includes(r.authority))throw new Error(r.id+": invalid authority");
    if((r.authority==="meta")!==(r.applies.kind==="meta"))throw new Error(r.id+": meta authority and meta applicability must be paired");
    const s=signal(r.applies);if(!["always","meta"].includes(s)){const reg=tax[r.applies.kind+"s"];if(!reg||!reg[r.applies.value])throw new Error(r.id+": unknown applicability "+s);}
  }
  const byId=new Map(rules.map(r=>[r.id,r]));
  for(const r of rules){
    r.references=[...r.text.matchAll(/\{\{rule:([a-z][a-z0-9]*(?:[.-][a-z0-9]+)*)\}\}/g)].map(m=>m[1]);
    for(const id of r.references){const target=byId.get(id);if(!target)throw new Error(r.id+": unknown semantic reference "+id);if(r.applies.kind!=="meta"&&target.applies.kind==="meta")throw new Error(r.id+": executable rule references meta rule "+id);const rs=signal(r.applies),ts=signal(target.applies);if(rs!=="meta"&&ts!=="always"&&ts!==rs)throw new Error(r.id+": cross-applicability reference "+id+" ("+rs+" -> "+ts+")");}
  }
  const usedSignals=new Set(rules.map(r=>signal(r.applies)).filter(s=>s!=="always"&&s!=="meta"));for(const s of usedSignals)if(!routeBySignal.has(s))throw new Error("active applicability has no skill route: "+s);for(const s of routeBySignal.keys())if(!usedSignals.has(s))throw new Error("skill route has no active doctrine rule: "+s);return{tax,rules,byId,routeBySignal};
}

function renderRuleBody(rule,byId){return cleanRuleText(rule.text).replace(/\{\{rule:([a-z][a-z0-9]*(?:[.-][a-z0-9]+)*)\}\}/g,(_m,id)=>"`"+byId.get(id).id+"`");}
function renderRule(rule,byId){return renderRuleBody(rule,byId);}
function renderGoverningRules(rules,byId){const index="Every rule below always applies. Invariants (highest tier): "+rules.filter(r=>r.authority==="invariant").map(r=>r.id).join(", ")+".\n\n";return index+rules.map(r=>renderRuleBody(r,byId).trimEnd()).join("\n\n")+"\n";}

function renderRules(rules,byId){return rules.map(r=>renderRule(r,byId).trimEnd()).join("\n\n")+"\n";}

function entry(tax,key){const i=key.indexOf(":");if(i<1)return null;const kind=key.slice(0,i),value=key.slice(i+1),reg=tax[kind+"s"];return reg&&reg[value]||null;}
function app(tax,key){const x=entry(tax,key);return x&&x.when;}
function cue(tax,key){const x=entry(tax,key);return x&&x.cue;}
function joinAlternatives(items){if(items.length===1)return items[0];if(items.length===2)return items[0]+"; or "+items[1];return items.slice(0,-1).join("; ")+"; or "+items[items.length-1];}

function compileDoctrine(src){
  const parsed=parseDoctrine(src),files=new Map(),governing=[],meta=[],skills=new Map(Object.entries(parsed.tax.skillCatalog).map(([name,spec])=>[name,{name,mode:spec.mode,summary:spec.discoverySummary,routes:spec.routes,signals:new Map(spec.routes.map(route=>[route.signal,{key:route.signal,ref:route.reference,rules:[]}])),rules:[]}]));
  for(const r of parsed.rules){
    const key=signal(r.applies);if(key==="always"){governing.push(r);continue;}if(key==="meta"){meta.push(r);continue;}
    const route=parsed.routeBySignal.get(key);if(!route)throw new Error(r.id+": no route for "+key);const skill=skills.get(route.skill);if(!skill)throw new Error(r.id+": unknown skill "+route.skill);
    skill.rules.push(r);const slot=skill.signals.get(key);if(!slot)throw new Error(route.skill+": missing catalog signal "+key);slot.rules.push(r);
  }
  for(const skill of skills.values()){
    if(!skill.rules.length)throw new Error("empty skill "+skill.name);skill.rules.sort((a,b)=>a.order-b.order);
    const labels=skill.routes.map(route=>{const value=cue(parsed.tax,route.signal);if(!value)throw new Error("missing discovery cue "+route.signal);return value.replace(/[.;]+$/,"");});skill.description=skill.summary+" Applies to "+joinAlternatives(labels)+".";
    if(skill.description.length>MAX_SKILL_DESCRIPTION_CHARS)throw new Error(skill.name+": generated description "+skill.description.length+" > "+MAX_SKILL_DESCRIPTION_CHARS);
    const base=["---","name: "+skill.name,"description: "+yaml(skill.description),"user-invocable: false","---","","## Responsibility","",skill.summary,""];
    if(skill.mode==="inline"){if([...skill.signals.values()].some(x=>x.ref!==null))throw new Error(skill.name+": inline skill has reference");files.set("plugin/skills/"+skill.name+"/SKILL.md",base.concat(["This summary is discovery orientation only; the canonical rule projection below carries the binding requirements.","",renderRules(skill.rules,parsed.byId).trimEnd(),""]).join("\n"));continue;}
    const body=base.concat(["Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.","","## Supporting references",""]);
    for(const route of skill.routes){const ref=skill.signals.get(route.signal);if(!ref||!ref.ref||!ref.rules.length)throw new Error(skill.name+": router route has no reference/rules "+route.signal);const when=app(parsed.tax,route.signal).replace(/[.;]+$/,""),label=cue(parsed.tax,route.signal).replace(/[.;]+$/,"");body.push("- ["+ref.ref+"](${CLAUDE_SKILL_DIR}/"+ref.ref+") — **"+label+".** Canonical trigger: "+when+".");files.set("plugin/skills/"+skill.name+"/"+ref.ref,renderRules(ref.rules,parsed.byId));}
    body.push("");files.set("plugin/skills/"+skill.name+"/SKILL.md",body.join("\n"));
  }
  const reviewRules=parsed.rules.filter(r=>signal(r.applies)==="stage:review");if(!reviewRules.length)throw new Error("missing review rules");
  const reviewerSkills=[...skills.keys()].map(name=>"engineering-doctrine:"+name);
  files.set("plugin/agents/doctrine-reviewer.md",["---","name: doctrine-reviewer","description: "+yaml("Use when "+app(parsed.tax,"stage:review").replace(/[.;]+$/,"")+" and an independent read-only reviewer is useful."),"tools: Read, Grep, Glob","model: inherit","skills:",...reviewerSkills.map(name=>"  - "+name),"---","","The preloaded doctrine skills are generated routing surfaces from the same canonical authority. Before judging the change, classify the concrete diff against their stage, surface, and condition triggers. Read every supporting reference whose trigger applies. Router links use resolved ${CLAUDE_SKILL_DIR} paths so the referenced rule text is available in this isolated subagent context. If an applicable reference cannot be read, report the review as incomplete rather than silently reviewing without it.","",renderRules(reviewRules,parsed.byId).trimEnd(),""].join("\n"));
  const kernel=renderGoverningRules(governing,parsed.byId);
  const runtime=event=>JSON.stringify({hookSpecificOutput:{hookEventName:event,additionalContext:kernel}})+"\n",sessionRuntime=runtime("SessionStart"),subagentRuntime=runtime("SubagentStart");
  if(sessionRuntime.length>=MAX_HOOK_JSON_CHARS)throw new Error("SessionStart governing payload "+sessionRuntime.length+" >= "+MAX_HOOK_JSON_CHARS);if(subagentRuntime.length>=MAX_HOOK_JSON_CHARS)throw new Error("SubagentStart governing payload "+subagentRuntime.length+" >= "+MAX_HOOK_JSON_CHARS);
  files.set("plugin/runtime/session-start.json",sessionRuntime);files.set("plugin/runtime/subagent-start.json",subagentRuntime);
  const runtimeReader=name=>({type:"command",command:'cat "${CLAUDE_PLUGIN_ROOT}/runtime/'+name+'.json"',timeout:5});
  const hookConfig={description:"Loads one atomic Engineering Doctrine governing kernel per session or subagent start. Hooks add context only.",hooks:{SessionStart:[{matcher:"startup|resume|clear|compact|fork",hooks:[runtimeReader("session-start")]}],SubagentStart:[{matcher:".*",hooks:[runtimeReader("subagent-start")]}]}};
  for(const group of Object.values(hookConfig.hooks))for(const entry of group)for(const hook of entry.hooks)if(!/^cat "\$\{CLAUDE_PLUGIN_ROOT\}\/runtime\/[a-z-]+\.json"$/.test(hook.command))throw new Error("runtime hook reader lost quoted plugin-root transport");
  files.set("plugin/hooks/hooks.json",JSON.stringify(hookConfig,null,2)+"\n");
  const ruleRoute=r=>{const key=signal(r.applies);if(key==="always")return{kind:"governing"};if(key==="meta")return{kind:"meta"};const route=parsed.routeBySignal.get(key);return{kind:"skill",skill:route.skill,reference:route.reference};};
  const manifest={schemaVersion:6,generated:true,packageRoot:"plugin",canonicalRepositoryPath:"doctrine/ENGINEERING_DOCTRINE.md",semanticIdentity:"stable-rule-id",presentationNumbersAreIdentity:false,retiredRuleIds:parsed.tax.retiredRuleIds,taxonomy:parsed.tax,rules:parsed.rules.map(r=>({id:r.id,presentation:r.presentation,title:r.title,authority:r.authority,applies:r.applies,signal:signal(r.applies),references:r.references,route:ruleRoute(r)})),governing:{maxHookJsonChars:MAX_HOOK_JSON_CHARS,sessionRuntimeJsonChars:sessionRuntime.length,subagentRuntimeJsonChars:subagentRuntime.length,ruleIds:governing.map(r=>r.id)},skills:Object.fromEntries([...skills].map(([name,s])=>[name,{mode:s.mode,discoverySummary:s.summary,description:s.description,signals:s.routes.map(route=>route.signal),ruleIds:s.rules.map(r=>r.id),references:s.mode==="router"?[...s.signals.values()].map(x=>({file:x.ref,signal:x.key,ruleIds:x.rules.map(r=>r.id)})):[]}])) ,agent:{name:"doctrine-reviewer",readOnlyTools:["Read","Grep","Glob"],preloadedSkills:reviewerSkills,ruleIds:reviewRules.map(r=>r.id)},hookTransport:{form:"shell",reader:"cat",quotedPluginRoot:true,runtimeDependency:"Claude Code documented hook shell"},metaRuleIds:meta.map(r=>r.id)};
  files.set("plugin/doctrine/projection-map.json",JSON.stringify(manifest,null,2)+"\n");for(const [rel,content] of files)if((rel.startsWith("plugin/skills/")||rel.startsWith("plugin/agents/"))&&(/<!-- GENERATED semantic projection/.test(content)||/<!-- d [a-z]/.test(content)))throw new Error("execution-facing markdown contains compiler provenance: "+rel);return{parsed,manifest,files};
}

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const GENERATED_ROOTS=["skills","agents","runtime","hooks","doctrine"];
const ROOT_RESERVED_PLUGIN_DIRS=["skills","agents","runtime","hooks","commands"];
const ROOT_RESERVED_PLUGIN_FILES=[".mcp.json",".lsp.json"];
function walk(dir,prefix=""){if(!fs.existsSync(dir))return[];const out=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){const rel=prefix?prefix+"/"+e.name:e.name,abs=path.join(dir,e.name);if(e.isDirectory())out.push(...walk(abs,rel));else out.push(rel);}return out;}
function read(rel){const p=path.join(ROOT,...rel.split("/"));return fs.existsSync(p)?fs.readFileSync(p,"utf8"):null;}
function assertPackageBoundary(){
  for(const name of ROOT_RESERVED_PLUGIN_DIRS) if(fs.existsSync(path.join(ROOT,name))) throw new Error("plugin component directory must live under plugin/: "+name);
  for(const name of ROOT_RESERVED_PLUGIN_FILES) if(fs.existsSync(path.join(ROOT,name))) throw new Error("plugin component file must live under plugin/: "+name);
  const rootMetadataDir=path.join(ROOT,".claude-plugin");
  if(!fs.existsSync(rootMetadataDir)) throw new Error("missing repository marketplace metadata directory");
  const rootMetadataEntries=fs.readdirSync(rootMetadataDir);
  if(rootMetadataEntries.length!==1||rootMetadataEntries[0]!=="marketplace.json") throw new Error("repository .claude-plugin may contain only marketplace.json");
  const pluginRoot=path.join(ROOT,"plugin");
  if(!fs.existsSync(pluginRoot)) throw new Error("missing plugin/");
  const allowedTop=new Set([".claude-plugin","skills","agents","runtime","hooks","doctrine"]);
  for(const entry of fs.readdirSync(pluginRoot)) if(!allowedTop.has(entry)) throw new Error("unexpected plugin-root entry outside closed package allowlist: "+entry);
  const metadataDir=path.join(pluginRoot,".claude-plugin");
  const metadataEntries=fs.readdirSync(metadataDir);
  if(metadataEntries.length!==1||metadataEntries[0]!=="plugin.json") throw new Error("plugin/.claude-plugin may contain only plugin.json");
  const manifest=JSON.parse(fs.readFileSync(path.join(metadataDir,"plugin.json"),"utf8"));
  const allowedManifestKeys=new Set(["$schema","name","displayName","description","author","repository","homepage","license","keywords","version"]);
  for(const key of Object.keys(manifest)) if(!allowedManifestKeys.has(key)) throw new Error("plugin manifest may not define component authority: "+key);
  if(manifest.name!=="engineering-doctrine") throw new Error("unexpected plugin name "+manifest.name);
  const marketplace=JSON.parse(fs.readFileSync(path.join(ROOT,".claude-plugin","marketplace.json"),"utf8"));
  if(marketplace.metadata&&Object.prototype.hasOwnProperty.call(marketplace.metadata,"pluginRoot")) throw new Error("marketplace metadata.pluginRoot may not redirect plugin authority");
  if(!Array.isArray(marketplace.plugins)||marketplace.plugins.length!==1) throw new Error("marketplace must expose exactly one plugin");
  const entry=marketplace.plugins[0];
  if(entry.name!=="engineering-doctrine"||entry.source!=="./plugin") throw new Error("marketplace must point engineering-doctrine exactly at ./plugin");
  const allowedEntryKeys=new Set(["name","source","description","author","keywords","category","version"]);
  for(const key of Object.keys(entry)) if(!allowedEntryKeys.has(key)) throw new Error("marketplace entry may not define component authority: "+key);
}
function main(){assertPackageBoundary();const canonical=fs.readFileSync(path.join(ROOT,"doctrine","ENGINEERING_DOCTRINE.md"),"utf8"),compiled=compileDoctrine(canonical),check=process.argv.includes("--check"),expected=new Set(compiled.files.keys());
if(check){let failed=false;for(const [rel,content] of compiled.files)if(read(rel)!==content){console.error("DRIFT "+rel);failed=true;}const actual=[];for(const root of GENERATED_ROOTS)for(const child of walk(path.join(ROOT,"plugin",root)))actual.push("plugin/"+root+"/"+child);for(const rel of actual)if(!expected.has(rel)){console.error("UNEXPECTED "+rel);failed=true;}for(const rel of expected)if(!actual.includes(rel)){console.error("MISSING "+rel);failed=true;}if(failed)process.exit(1);console.log("Doctrine projections match canonical source; governing SessionStart payload "+compiled.manifest.governing.sessionRuntimeJsonChars+" chars.");return;}
for(const root of GENERATED_ROOTS)fs.rmSync(path.join(ROOT,"plugin",root),{recursive:true,force:true});for(const [rel,content] of compiled.files){const p=path.join(ROOT,...rel.split("/"));fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content);}console.log("Generated "+compiled.files.size+" doctrine projection files; governing SessionStart payload "+compiled.manifest.governing.sessionRuntimeJsonChars+" chars.");}
if(process.argv[1]===fileURLToPath(import.meta.url))main();
