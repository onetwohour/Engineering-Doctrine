---
name: comments-and-documentation
description: Writing, expanding, or reviewing a source comment, docstring, or API documentation comment; or writing or updating a README, architecture note, runbook, guide, changelog, or other permanent or generated documentation. Read this doctrine BEFORE writing or reviewing a comment, docstring, README, runbook, or changelog.
user-invocable: false
---

## Responsibility

Keeps repository prose where it owns durable knowledge: comments preserve non-obvious local constraints, while documentation serves cold readers and current truth.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Writing, expanding, or reviewing a source comment, docstring, or API documentation comment.** Canonical trigger: source comments, docstrings, or API documentation comments are meaningfully changed or reviewed.

## 22. Comments

Source comments are exceptional in ordinary implementation code, not a parallel explanation layer. **Default to self-explanatory code and no comment unless prose preserves non-obvious knowledge that cannot be expressed as clearly in names, types, structure, executable invariants, tests, or a more appropriate contract.** New or generated code does not need a comment merely because it is new.

Comments explain what code, types, tests, and structure cannot make sufficiently clear: a non-obvious invariant, why an apparently simpler implementation is wrong, a compatibility or external-system constraint, a security or data-preservation requirement, a race or lifetime rule, an important algorithmic or performance rationale, a protocol or unit convention, or a decision a future maintainer would otherwise have to rediscover at material cost.

Before keeping a comment, apply the **deletion test**:

> If this comment vanished, what specific non-obvious knowledge would be lost, what material fact would need to be rediscovered, or what plausible maintenance mistake would become more likely?

If there is no concrete answer, delete it.

```text
✗ // increment counter
✗ // This is where the settings live.
✗ // In this world, this layer only carries the file.
✓ // Retry twice: upstream returns 502 during cold start (vendor#412).
✓ // Keep the old key until v3 files are no longer supported.
✓ // Do not canonicalize here: symlink identity is part of the contract.

```

Do not use comments to narrate what a file, type, field, constant, function, branch, loop, or statement does when its name, type, value, or structure already says it. Do not add a summary comment above every function or a heading above every logical block. Do not paraphrase the next line, restate a signature in a docstring, or use comments as visual separators for otherwise ordinary code. Do not restate architectural philosophy already represented by module boundaries, types, tests, or authoritative documentation. Do not record thought process, implementation journey, discoveries, rejected attempts, task context, progress notes, agent instructions, or commented-out dead code.

Do not invent storytelling, personification, product lore, scene-setting, or decorative metaphors where precise domain or technical language will do. Established technical or domain metaphors are acceptable when they are the shared, clearest vocabulary; do not replace familiar terms merely to sound literal. State the actual constraint directly. Comments are local: place knowledge at the narrowest point where a maintainer needs it, and do not duplicate the same rationale at module, type, field, and call-site levels.

Prefer, in order: clearer names → stronger types or structure → executable invariants and tests → a short local comment → durable documentation only when the knowledge genuinely belongs there. Multiple paragraphs in ordinary implementation code are a warning sign: either the design is unclear, the knowledge belongs elsewhere, or most of the comment should be removed.

Use markup only where it is actually interpreted. Markdown belongs in Markdown documents and documentation systems that render it; do not put emphasis markers, headings, fenced blocks, or other decorative Markdown into plain source comments where the markers are displayed literally. In plain comments, make the wording carry the emphasis.

Do not make a source comment depend on mutable internal document section numbers, rule numbers, or transient task references. State the relevant constraint locally. A stable protocol, specification, issue, or upstream reference is legitimate when that external source is itself part of the contract or carries necessary detail that should not be duplicated locally.

```text
✗ // Check the resource version as required by §6.2; selection is **below** text.
✓ // Draw selection below text; drawing it above obscures glyphs.

```

### 22.1 Documentation comments

Public documentation comments describe the caller-visible contract, not the implementation story. Document only information a caller cannot reliably infer from the item name, type or signature, ordinary semantics, nearby types, or compiler-enforced constraints.

Useful API documentation includes, when applicable: semantic meaning not encoded in the type; invariants; units; ownership or lifetime semantics; failure behavior; side effects; ordering or concurrency guarantees; compatibility constraints. Do not document private fields individually unless a field carries a non-obvious constraint. Prefer one type-level contract over repeating prose on every field.

### 22.2 Comment review

During review, apply the deletion test and contract standard from `comments.core` to every added or materially expanded source comment or docstring.

Comment density is a diagnostic signal, never a target. If prose dominates ordinary implementation code, determine whether it preserves real non-obvious contract or constraint knowledge; otherwise prefer clearer code or remove the narration. Do not game a ratio by compressing code or deleting useful public API contracts.

---

**Cue: Writing or updating a README, architecture note, runbook, guide, changelog, or other permanent or generated documentation.** Canonical trigger: permanent or generated documentation is meaningfully changed or reviewed.

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
