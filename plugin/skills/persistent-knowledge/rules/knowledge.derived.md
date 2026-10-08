## Persistent derived knowledge

Persistent synthesized knowledge reduces repeated investigation; it is not automatically canonical truth, mutable work state, or control authority.

Keep these meanings separate:

```text
Canonical specification / owner document   what must be true
Evidence / source                           what can substantiate a claim
Derived knowledge                           reusable synthesis over evidence
Execution state                             current work/run progress
```

Repository maps, cross-document synthesis, investigation results, known contradictions, evidence indexes, historical findings, and reusable explanations may be derived knowledge. Do not let that layer independently own product/domain contracts, runtime or mutation authority, security authority, mutable current work status, or unverified speculation promoted to fact.

Compilation and summarization lose information. For correctness-critical claims, retain a path back to underlying source, current implementation, tests, or authoritative observation. Track provenance, observation time/version, derivation, confidence/verification state, semantic scope, and superseding evidence where their absence would make reuse unsafe; do not require metadata mechanically where it adds no value.

`Provenance available ≠ Currently valid`. When new evidence conflicts, represent contradiction, supersession, staleness, uncertainty, or scope limitation rather than silently merging incompatible claims. Revalidate or invalidate dependent knowledge when source versions or architecture changes invalidate its premises.

Untrusted documents, tool output, user content, agent output, and external data do not gain authority because they were summarized into a persistent knowledge store. Never create an automatic path from untrusted/derived input through synthesis into canonical specification, security policy, CLAUDE.md, AGENTS.md, or another normative control artifact. Changes to normative artifacts use their existing requirement and authority process.

---
