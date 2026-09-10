---
name: documentation
description: Writing or updating a README, architecture note, runbook, guide, changelog, or an agent instruction file such as CLAUDE.md or a scoped rule. Read this doctrine BEFORE writing or reviewing project documentation or instructions.
---

## Responsibility

Keeps durable documentation serving a cold reader and current truth, and keeps agent-facing instruction files scoped to what actually needs loading.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Writing or updating a README, architecture note, runbook, guide, changelog, or an agent instruction file such as CLAUDE.md or a scoped rule.** Canonical trigger: permanent or generated documentation, or an agent-facing instruction file, is meaningfully changed or reviewed.

## 24. Documentation

Documentation exists to serve a reader, not to prove that work happened. Do not create or modify documentation unless the owner asks, the repository requires it, a public or interface change requires it, existing documentation would otherwise become false, or durable operational or architectural knowledge genuinely requires prose.

**The maintenance question is part of the decision to write.** Before creating any document, answer: who updates this when the thing it describes changes, and how will anyone notice it has gone wrong? If there is no answer, do not write it. Every document you create is a promise to keep it true; stale documentation is worse than none, because wrong docs stop the reader from checking the code.

Prefer forms that remain synchronized with reality: expressive code → executable tests, schemas, examples, and types → generated documentation → comments beside the implementation → durable owned prose. Decay is proportional to distance from what is described.

Do not duplicate authoritative code structure into prose without a maintenance reason — directory listings, function signatures, config keys, API fields, parameter tables should stay generated. Never knowingly leave documentation describing behavior that changed: update it in the same change or report that it remains stale. Do not silently delete stale documentation owned by someone else (`safety.no-silent-destruction`).

### 24.1 Write for a cold reader

Permanent documentation must make sense to a competent reader who opens it later with **no access to the conversation, task prompt, current diff, implementation sequence, or author's session memory**.

Before keeping a passage, apply the **cold-reader test**:

> Can a reader identify every important subject, referent, term, state, decision, and prerequisite from this document and stable linked context alone?

Do not rely on session-relative language such as "this change," "the issue above," "the previous implementation," "the new path," "what we discussed," "now," "currently" used only relative to the task, or "as mentioned earlier" when the referenced context is outside the durable document. Local pronouns and references are fine when their antecedents are unambiguous inside the text; durable prose must not require hidden context.

Name the actual subsystem, state, operation, version, contract, or decision. Define unfamiliar project-local terms before depending on them. Prefer stable headings, identifiers, versions, dates, or links over positional references such as "the section above" when the relationship must survive document edits.

A document is not self-contained merely because every sentence is grammatical. The reader must be able to reconstruct the relevant model without knowing why the author happened to write it.

### 24.2 Describe current truth before change history

Reference documentation — README, architecture and design descriptions, operational guides, interface documentation, maintenance notes — describes **the system that exists and the model the reader should use now**. Write the current ownership, behavior, invariant, lifecycle, command, or procedure directly.

Do not turn permanent reference prose into a work diary:

```text
✗ Previously the cache lived in SessionManager, but during this task we moved
  it to Workspace. Now the new flow calls Workspace first.

✓ Workspace owns the cache. SessionManager requests cached state through
  Workspace and does not mutate cache entries directly.
```

Do not preserve the chronology of discovery merely because that is how the author learned the system: "we first tried A," "then tests failed," "after review we changed B," "the old design did X but this implementation now does Y." If a reader only needs the resulting rule, state the resulting rule.

History is legitimate when **history itself is the document's subject or part of its contract**: ADRs, changelogs, release notes, migration guides, compatibility notes, incident reports, deprecation timelines, and postmortems. In those documents, anchor history to durable facts — versions, dates, decision IDs, released behavior, migration boundaries — rather than to the writing session. Preserve only history that explains a decision, compatibility obligation, migration step, incident cause, or other future-relevant fact.

Do not erase meaningful history from an ADR or migration document merely to make everything present tense. The rule is **current truth for reference documents; explicit, purpose-owned history for historical documents**.

### 24.3 Transform task state; never publish it by copy

Task plans, progress notes, temporary implementation summaries, investigation logs, and durable task state are intentionally task-relative. They may contain chronology, rejected hypotheses, "next action," temporary file lists, and session-specific shorthand that is useful during execution and wrong for permanent documentation.

Do not copy or lightly edit those artifacts into README, architecture docs, runbooks, or API documentation. Extract the durable knowledge, verify it against the final repository state, choose the document that owns it, and rewrite it for the cold reader.

If the only reason a sentence exists is "this happened during the task," it belongs in task state, commit history, a changelog/release note when release history matters, or nowhere — not in current-state documentation.

### 24.4 Durable prose is legitimate when it owns real knowledge

Standalone prose is appropriate when it owns knowledge executable artifacts cannot adequately express: ADRs, operational runbooks, migration contracts, recovery procedures, security or compatibility rationale, externally meaningful protocol decisions. Such documentation needs a durable purpose, a clear audience, an identifiable maintenance owner or mechanism, and a reason it cannot be expressed more reliably elsewhere.

Structure the document around the reader's questions and the knowledge being owned, not around the order in which the implementation work happened. A durable document should remain useful after the task, branch, author, and conversation are forgotten.

---

### 24.5 Instructions to an agent are documentation with a load rule

A project's agent-facing instructions are documentation whose reader is a machine. The same ownership question decides where each one belongs, plus a second: when does this need to be in context at all.

Follow the project's existing convention. Where none exists, place each instruction where it is needed and no wider. Repository-wide orientation, the build and test commands, and the conventions an agent gets wrong belong in the always-loaded project instruction file. A rule that governs one subsystem belongs beside that subsystem. A rule that applies to one topic or path belongs in a scoped rule that loads when that path is touched. Execution policy — permissions, hooks, environment, tool configuration — belongs in settings, not in prose.

Keep the always-loaded file short; every line in it competes with the task for the same attention. Do not restate what the code, types, tests, schemas, or generated documentation already state, and do not let an instruction file become a project encyclopedia, an architecture dump, a feature plan, or a change log.

**An instruction is advice; only a mechanism decides.** Instruction files shape behavior and cannot guarantee it. When an invariant matters enough that violating it must be impossible, pair the instruction with something that decides it — a hook, test, schema, type, lint rule, or CI check — rather than relying on the prose to hold. Where nothing can decide it, prose is the right tool and a gate is not.

---
