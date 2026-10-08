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
