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
  const tax=JSON.parse(taxMatch[1]);if(tax.schemaVersion!==4)throw new Error("unsupported applicability schema "+tax.schemaVersion);
  if(!Array.isArray(tax.retiredRuleIds))throw new Error("missing retiredRuleIds tombstone ledger");
  const retiredSeen=new Set();for(const id of tax.retiredRuleIds){if(!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(id)||retiredSeen.has(id))throw new Error("invalid/duplicate retired semantic id "+id);retiredSeen.add(id);}
  for(const kind of ["stage","surface","condition"]){const reg=tax[kind+"s"];if(!reg||typeof reg!=="object"||Array.isArray(reg))throw new Error("missing "+kind+" applicability registry");for(const [value,item] of Object.entries(reg)){if(!item||typeof item.when!=="string"||!item.when.trim())throw new Error(kind+":"+value+": missing canonical when predicate");if(typeof item.cue!=="string"||!item.cue.trim())throw new Error(kind+":"+value+": missing discovery cue");if(item.cue.length>180)throw new Error(kind+":"+value+": discovery cue too long");}}
  if(!tax.skillCatalog||typeof tax.skillCatalog!=="object"||Array.isArray(tax.skillCatalog)||!Object.keys(tax.skillCatalog).length)throw new Error("missing skillCatalog");
  const routeBySignal=new Map();
  for(const [name,spec] of Object.entries(tax.skillCatalog)){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)||name.length>64||/(anthropic|claude)/.test(name))throw new Error("invalid skill name "+name);if(!spec||typeof spec!=="object"||Array.isArray(spec)||Object.keys(spec).sort().join(",")!=="discoverySummary,moment,routes")throw new Error(name+": skill spec must contain exactly moment, discoverySummary, and routes");for(const [field,min,max] of [["moment",20,80],["discoverySummary",40,420]]){const text=spec[field];if(typeof text!=="string"||text.trim()!==text||text.length<min||text.length>max||/\n|<[^>]*>/.test(text))throw new Error(name+": invalid "+field);if(/\b(?:I|we|you|your|our)\b/i.test(text))throw new Error(name+": "+field+" must stay third-person");if(/\b(?:must|never|always)\b|\bdo not\b/i.test(text))throw new Error(name+": "+field+" may not state binding requirements");}if(!Array.isArray(spec.routes)||!spec.routes.length)throw new Error(name+": missing routes");for(let i=0;i<spec.routes.length;i++){const sig=spec.routes[i];if(typeof sig!=="string")throw new Error(name+": route "+i+" must be a signal string");const p=sig.indexOf(":"),kind=sig.slice(0,p),value=sig.slice(p+1),reg=tax[kind+"s"];if(p<1||!reg||!reg[value])throw new Error(name+": unknown route signal "+sig);if(routeBySignal.has(sig))throw new Error("signal routed more than once: "+sig);routeBySignal.set(sig,{skill:name,priority:i});}}
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
  for(const r of rules)if(/\{\{routing-table\}\}/.test(r.text)&&signal(r.applies)!=="always")throw new Error(r.id+": routing-table placeholder outside the always tier");
  const usedSignals=new Set(rules.map(r=>signal(r.applies)).filter(s=>s!=="always"&&s!=="meta"));for(const s of usedSignals)if(!routeBySignal.has(s))throw new Error("active applicability has no skill route: "+s);for(const s of routeBySignal.keys())if(!usedSignals.has(s))throw new Error("skill route has no active doctrine rule: "+s);return{tax,rules,byId,routeBySignal};
}

function renderRuleBody(rule,byId){return cleanRuleText(rule.text).replace(/\{\{rule:([a-z][a-z0-9]*(?:[.-][a-z0-9]+)*)\}\}/g,(_m,id)=>"`"+byId.get(id).id+"`");}
function renderRule(rule,byId){return renderRuleBody(rule,byId);}
const MUTATION_FLOOR={signal:"condition:mutation",tools:["Edit","Write","NotebookEdit"]};
function renderRoutingTable(tax){return "Load before the first action of each moment:\n"+Object.entries(tax.skillCatalog).map(([name,spec])=>"- "+spec.moment.replace(/[.;]+$/,"")+" → "+name).join("\n");}
function renderGoverningRules(rules,byId,tax){const index="Every rule below always applies. Invariants (highest tier): "+rules.filter(r=>r.authority==="invariant").map(r=>r.id).join(", ")+".\n\n";let placed=0;const body=rules.map(r=>renderRuleBody(r,byId).trimEnd().replace(/\{\{routing-table\}\}/g,()=>{placed++;return renderRoutingTable(tax);})).join("\n\n");if(placed!==1)throw new Error("governing rules must place {{routing-table}} exactly once, found "+placed);return index+body+"\n";}

function renderRules(rules,byId){return rules.map(r=>renderRule(r,byId).trimEnd()).join("\n\n")+"\n";}

function entry(tax,key){const i=key.indexOf(":");if(i<1)return null;const kind=key.slice(0,i),value=key.slice(i+1),reg=tax[kind+"s"];return reg&&reg[value]||null;}
function app(tax,key){const x=entry(tax,key);return x&&x.when;}
function cue(tax,key){const x=entry(tax,key);return x&&x.cue;}
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function joinAlternatives(items){if(items.length===1)return items[0];if(items.length===2)return items[0]+"; or "+items[1];return items.slice(0,-1).join("; ")+"; or "+items[items.length-1];}

function compileDoctrine(src,runtimeSource){
  const parsed=parseDoctrine(src),files=new Map(),governing=[],meta=[],skills=new Map(Object.entries(parsed.tax.skillCatalog).map(([name,spec])=>[name,{name,moment:spec.moment,summary:spec.discoverySummary,routes:spec.routes,signals:new Map(spec.routes.map(sig=>[sig,{key:sig,rules:[]}])),rules:[]}]));
  for(const r of parsed.rules){
    const key=signal(r.applies);if(key==="always"){governing.push(r);continue;}if(key==="meta"){meta.push(r);continue;}
    const route=parsed.routeBySignal.get(key);if(!route)throw new Error(r.id+": no route for "+key);const skill=skills.get(route.skill);if(!skill)throw new Error(r.id+": unknown skill "+route.skill);
    skill.rules.push(r);const slot=skill.signals.get(key);if(!slot)throw new Error(route.skill+": missing catalog signal "+key);slot.rules.push(r);
  }
  for(const skill of skills.values()){
    if(!skill.rules.length)throw new Error("empty skill "+skill.name);skill.rules.sort((a,b)=>a.order-b.order);
    const labels=skill.routes.map(sig=>{const value=cue(parsed.tax,sig);if(!value)throw new Error("missing discovery cue "+sig);return value.replace(/[.;]+$/,"");});
    skill.description=capitalize(joinAlternatives(labels))+". Read this doctrine BEFORE "+skill.moment.replace(/[.;]+$/,"")+".";
    if(skill.description.length>MAX_SKILL_DESCRIPTION_CHARS)throw new Error(skill.name+": generated description "+skill.description.length+" > "+MAX_SKILL_DESCRIPTION_CHARS);
    const body=["---","name: "+skill.name,"description: "+yaml(skill.description),"---","","## Responsibility","",skill.summary,"","Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.",""];
    let current=null;
    for(const r of skill.rules){const key=signal(r.applies);if(key!==current){current=key;body.push("**Cue: "+capitalize(cue(parsed.tax,key).replace(/[.;]+$/,""))+".** Canonical trigger: "+app(parsed.tax,key).replace(/[.;]+$/,"")+".","");}body.push(renderRule(r,parsed.byId).trimEnd(),"");}
    files.set("plugin/skills/"+skill.name+"/SKILL.md",body.join("\n"));
  }
  const reviewRules=parsed.rules.filter(r=>signal(r.applies)==="stage:review");if(!reviewRules.length)throw new Error("missing review rules");
  const reviewerSkills=[...skills.keys()].map(name=>"engineering-doctrine:"+name);
  files.set("plugin/agents/doctrine-reviewer.md",["---","name: doctrine-reviewer","description: "+yaml("Use when "+app(parsed.tax,"stage:review").replace(/[.;]+$/,"")+" and an independent read-only reviewer is useful."),"tools: Read, Grep, Glob","model: inherit","skills:",...reviewerSkills.map(name=>"  - "+name),"---","","The preloaded doctrine skills are generated from the same canonical authority and carry every rule's full text inline; nothing further needs to be read. Before judging the change, classify the concrete diff against the triggers stated in each skill and apply every rule whose trigger applies.","",renderRules(reviewRules,parsed.byId).trimEnd(),""].join("\n"));
  const kernel=renderGoverningRules(governing,parsed.byId,parsed.tax);
  const runtime=(event,extra={})=>JSON.stringify({hookSpecificOutput:{hookEventName:event,additionalContext:kernel,...extra}})+"\n",sessionRuntime=runtime("SessionStart",{reloadSkills:true}),subagentRuntime=runtime("SubagentStart");
  if(sessionRuntime.length>=MAX_HOOK_JSON_CHARS)throw new Error("SessionStart governing payload "+sessionRuntime.length+" >= "+MAX_HOOK_JSON_CHARS);if(subagentRuntime.length>=MAX_HOOK_JSON_CHARS)throw new Error("SubagentStart governing payload "+subagentRuntime.length+" >= "+MAX_HOOK_JSON_CHARS);
  files.set("plugin/runtime/session-start.json",sessionRuntime);files.set("plugin/runtime/subagent-start.json",subagentRuntime);
  if(typeof runtimeSource!=="string"||!runtimeSource.trim())throw new Error("missing doctrine runtime source");
  files.set("plugin/runtime/doctrine-runtime.mjs",runtimeSource.trimEnd()+"\n");
  const runtimeHook=mode=>({type:"command",command:"node",args:["${CLAUDE_PLUGIN_ROOT}/runtime/doctrine-runtime.mjs",mode],timeout:5});
  const hookConfig={description:"Loads the Engineering Doctrine governing kernel, reports doctrine state (which skills' rules were actually delivered, which were invoked without delivery, tools used) at native decision points, and holds a mechanical floor under persistent edits. Hooks never classify applicability; the only block is the mutation floor.",hooks:{SessionStart:[{matcher:"startup|resume|clear|compact|fork",hooks:[runtimeHook("session-context")]}],SubagentStart:[{matcher:".*",hooks:[runtimeHook("subagent-context")]}],UserPromptSubmit:[{hooks:[runtimeHook("prompt")]}],PreToolUse:[{matcher:MUTATION_FLOOR.tools.join("|"),hooks:[runtimeHook("pre-mutation")]}],PostToolUseFailure:[{matcher:".*",hooks:[runtimeHook("failure")]}],PostToolBatch:[{hooks:[runtimeHook("batch")]}]}};
  const hookModes=new Set(["session-context","subagent-context","prompt","pre-mutation","failure","batch"]);
  for(const group of Object.values(hookConfig.hooks))for(const entry of group)for(const hook of entry.hooks){if(hook.command!=="node"||!Array.isArray(hook.args)||hook.args.length!==2||hook.args[0]!=="${CLAUDE_PLUGIN_ROOT}/runtime/doctrine-runtime.mjs"||!hookModes.has(hook.args[1]))throw new Error("runtime hook lost cross-platform exec transport");}
  files.set("plugin/hooks/hooks.json",JSON.stringify(hookConfig,null,2)+"\n");
  const ruleRoute=r=>{const key=signal(r.applies);if(key==="always")return{kind:"governing"};if(key==="meta")return{kind:"meta"};const route=parsed.routeBySignal.get(key);return{kind:"skill",skill:route.skill};};
  const manifest={schemaVersion:10,generated:true,packageRoot:"plugin",canonicalRepositoryPath:"doctrine/ENGINEERING_DOCTRINE.md",semanticIdentity:"stable-rule-id",presentationNumbersAreIdentity:false,retiredRuleIds:parsed.tax.retiredRuleIds,taxonomy:parsed.tax,rules:parsed.rules.map(r=>({id:r.id,presentation:r.presentation,title:r.title,authority:r.authority,applies:r.applies,signal:signal(r.applies),references:r.references,route:ruleRoute(r)})),governing:{maxHookJsonChars:MAX_HOOK_JSON_CHARS,sessionRuntimeJsonChars:sessionRuntime.length,subagentRuntimeJsonChars:subagentRuntime.length,ruleIds:governing.map(r=>r.id)},skills:Object.fromEntries([...skills].map(([name,s])=>[name,{moment:s.moment,discoverySummary:s.summary,description:s.description,signals:s.routes,ruleIds:s.rules.map(r=>r.id)}])) ,agent:{name:"doctrine-reviewer",readOnlyTools:["Read","Grep","Glob"],preloadedSkills:reviewerSkills,ruleIds:reviewRules.map(r=>r.id)},attention:{protocolVersion:1,role:"attention-scheduler",classifier:"active Claude agent",routeSource:"taxonomy.skillCatalog",persistentRoutingState:false,classifies:false,blocking:{scope:MUTATION_FLOOR.signal,tools:MUTATION_FLOOR.tools,requires:"engineering-doctrine:"+parsed.routeBySignal.get(MUTATION_FLOOR.signal).skill,evidence:"session transcript",opensWhenUnprovable:true},reports:{source:"session transcript",evidence:"a skill counts as delivered when its discoverySummary appears in a transcript text block; an invocation alone does not",facts:["doctrine skills whose rules were delivered","skills invoked without delivery","tools used in the batch","git subcommands seen"],suppressedWhenUnchanged:true,fallsBackToInvocation:"when no delivery is detectable at all"},checkpoints:[{event:"UserPromptSubmit",purpose:"doctrine state plus the initial moment judgment"},{event:"PreToolUse",purpose:"mechanical mutation floor"},{event:"PostToolBatch",purpose:"doctrine state after an acting batch, when it changed"},{event:"PostToolUseFailure",purpose:"failure-evidence applicability reassessment"}],compactionRecovery:{event:"SessionStart",reloadSkills:true}},hookTransport:{form:"exec",executable:"node",script:"runtime/doctrine-runtime.mjs",pluginRootPlaceholder:true,runtimeDependency:"Claude Code documented Node command-hook execution"},metaRuleIds:meta.map(r=>r.id)};
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
  if(fs.existsSync(path.join(ROOT,".claude-plugin"))) throw new Error("the marketplace moved to onetwohour/claude-plugins; a second one here would collide with it under the same name");
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
}
function main(){assertPackageBoundary();const canonical=fs.readFileSync(path.join(ROOT,"doctrine","ENGINEERING_DOCTRINE.md"),"utf8"),runtimeSource=fs.readFileSync(path.join(ROOT,"scripts","doctrine-runtime.mjs"),"utf8"),compiled=compileDoctrine(canonical,runtimeSource),check=process.argv.includes("--check"),expected=new Set(compiled.files.keys());
if(check){let failed=false;for(const [rel,content] of compiled.files)if(read(rel)!==content){console.error("DRIFT "+rel);failed=true;}const actual=[];for(const root of GENERATED_ROOTS)for(const child of walk(path.join(ROOT,"plugin",root)))actual.push("plugin/"+root+"/"+child);for(const rel of actual)if(!expected.has(rel)){console.error("UNEXPECTED "+rel);failed=true;}for(const rel of expected)if(!actual.includes(rel)){console.error("MISSING "+rel);failed=true;}if(failed)process.exit(1);console.log("Doctrine projections match canonical source; governing SessionStart payload "+compiled.manifest.governing.sessionRuntimeJsonChars+" chars.");return;}
for(const root of GENERATED_ROOTS)fs.rmSync(path.join(ROOT,"plugin",root),{recursive:true,force:true});for(const [rel,content] of compiled.files){const p=path.join(ROOT,...rel.split("/"));fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content);}console.log("Generated "+compiled.files.size+" doctrine projection files; governing SessionStart payload "+compiled.manifest.governing.sessionRuntimeJsonChars+" chars.");}
if(process.argv[1]===fileURLToPath(import.meta.url))main();
