---
name: implementation
description: Writing or changing executable behavior, configuration, or data handling, including one-line and trivial edits, or code that acquires a resource; adding a new type, module, helper, service, adapter, validator, error type, config mechanism, or abstraction that may already exist; or writing, expanding, or reviewing a source comment, docstring, or API documentation comment. Read this doctrine BEFORE writing code, configuration, data handling, or source comments.
---

## Responsibility

Implements the chosen design while preserving established contracts, data, and behavior, binds each acquired resource to an owner and a guaranteed release, keeps source comments exceptional rather than a parallel narration layer, and returns to the model when implementation evidence contradicts it.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Writing or changing executable behavior, configuration, or data handling, including one-line and trivial edits, or code that acquires a resource.** Canonical trigger: implementing or changing executable behavior, configuration, data handling, or generated implementation artifacts, including trivial changes.

## 10. Scope and root cause

Fix the root cause at the narrowest **correct** level. "Smallest coherent implementation" means the least unnecessary breadth that still fully delivers the requested outcome and fixes the cause — not the fewest edited lines or the smallest coherent subset. Narrow scope never licenses partial delivery.

**Investigation scope, solution-search scope, and mutation scope are different.** Keep mutation no broader than causality and the requested outcome require, but investigate broadly enough to establish the cause and consider alternatives broadly enough to avoid premature fixation. "Narrow scope" does not mean "inspect only nearby code," "assume the symptom is local," or "consider only local fixes." Expand along real causal paths until the model is supported by evidence; only then contract the change. A small diff is a possible result of broad understanding, not a constraint imposed before understanding.

If the cause is wrong ownership, duplicated policy, missing validation, a missing invariant, an incorrect lifecycle, or a broken general rule — fix that cause across as many files as required. Do not patch only where the symptom appears if that preserves the underlying defect.

Equally: **if investigation establishes that ownership, boundaries, invariants, and the domain model are already correct and the defect is truly local, fix it locally.** Do not invent a deeper architectural cause merely because one can be imagined. Local bugs are allowed to be local.

```text
"Fix the duplicate charge on payment retry."
Cause: retry path and webhook handler both write order.status; no owner.
✓ Give status one owner; route both paths through it — four files.
✗ if order.status == "paid": return    three lines that preserve the defect.

"Fix the date shown as 'Jan 32' in the export."
Cause: off-by-one in one formatter; ownership and model already correct.
✓ Fix the line. Add the regression test.
✗ Redesign the export pipeline the bug "reveals."

```

Correct scope is determined by causality — not by line count, and not by a preference for architectural change.

---

## 13. Implementation

Implement the chosen design faithfully. Preserve existing public APIs, stored data, formats, configuration, preferences, integrations, workflows, and user interaction patterns unless changing them is required by the task.

Never ship placeholder behavior as real. Do not present as complete: hardcoded success values, dummy business logic, production branches that exist only for tests, fabricated realistic data, no-op integrations presented as functioning, or temporary code presented as finished.

Challenge the implementation against the failure dimensions that are material to its model. As applicable, consider malformed or empty input, boundary values, concurrent access, ordering, cancellation, retry, duplicate delivery, partial failure, persistence or commit failure, external side effects, restart, rollback, and recovery. This is a seed list, not a mandatory checklist; follow the actual state machine, boundaries, and risks.

When multiple paths can mutate the same state, identify who owns the decision and which transition wins. If a material race, failure transition, or recovery state cannot be explained, the implementation is not ready to be treated as complete.

If implementation exposes evidence that invalidates the design, return to the earliest affected stage and correct the model rather than accumulating patches around the contradiction.

---

### 13.1 Bind every resource to an owner and a release

Every acquired resource needs an owner and a release bound to that owner's lifetime: memory, file descriptors and handles, sockets, locks, transactions, subprocesses, temporary files, timers, watchers, subscriptions, pooled connections, and device contexts.

Prefer the construct the language already provides for scope-bound release — destructors, `defer`, `using`, `with`, try-with-resources, context managers, structured concurrency scopes — over paired acquire and release calls that a maintainer has to keep matched by hand.

Release must hold on every exit path, not only the successful one: early return, exception, cancellation, timeout, retry, and shutdown. A release that runs only when a later line is reached is already a leak, and so is one a caller has to remember to invoke when nothing in the type says so.

Ownership is singular and transferable, not ambient. Two owners each releasing is a double free; two owners each assuming the other releases is a leak. When a resource genuinely outlives its creator, name the owner it passes to rather than leaving the transfer implicit.

---

**Cue: Adding a new type, module, helper, service, adapter, validator, error type, config mechanism, or abstraction that may already exist.** Canonical trigger: introducing a new type, module, helper, utility, service, repository, adapter, parser, serializer, validator, error type, configuration mechanism, or architectural abstraction.

### 13.2 Find the existing owner before adding a concept

Before introducing a new type, module, helper, utility, service, repository, adapter, parser, serializer, validator, error type, configuration mechanism, or architectural abstraction, search for the concept and behavior already present in the repository — not only the name you intend to use. If overlapping implementations exist, determine the canonical owner before adding another. A new abstraction needs a clear responsibility, owner, and reason it cannot be expressed by an existing concept without making that concept less coherent.

---

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
✗ // 2026-03-14 jdoe: switched to the v2 client, see TICKET-812
✗ // TODO(next sprint): revisit once the migration lands
✓ // Retry twice: upstream returns 502 during cold start (vendor#412).
✓ // Keep the old key until v3 files are no longer supported.
✓ // Do not canonicalize here: symlink identity is part of the contract.

```

Do not use comments to narrate what a file, type, field, constant, function, branch, loop, or statement does when its name, type, value, or structure already says it. Do not add a summary comment above every function or a heading above every logical block. Do not paraphrase the next line, restate a signature in a docstring, or use comments as visual separators for otherwise ordinary code. Do not restate architectural philosophy already represented by module boundaries, types, tests, or authoritative documentation. Do not record thought process, implementation journey, discoveries, rejected attempts, task context, progress notes, agent instructions, or commented-out dead code.

**A comment is not a document and not a record.** Do not carry in source comments what a README, architecture note, ADR, changelog, release note, commit message, issue, or task record owns: change history, migration narratives, decision logs, TODO backlogs, ticket status, dates, authorship, or "changed in v2" annotations. Version control already records when a line changed and who changed it; a comment repeating that goes stale the moment the code moves, and no reader can tell whether it is still true. When the knowledge is durable but its reader is someone other than the maintainer standing at this line, move it to the artifact that owns it rather than keeping a copy here.

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
