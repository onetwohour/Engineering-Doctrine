### 24.1 Write for a cold reader

Permanent documentation must make sense to a competent reader who opens it later with **no access to the conversation, task prompt, current diff, implementation sequence, or author's session memory**.

Before keeping a passage, apply the **cold-reader test**:

> Can a reader identify every important subject, referent, term, state, decision, and prerequisite from this document and stable linked context alone?

Do not rely on session-relative language such as "this change," "the issue above," "the previous implementation," "the new path," "what we discussed," "now," "currently" used only relative to the task, or "as mentioned earlier" when the referenced context is outside the durable document. Local pronouns and references are fine when their antecedents are unambiguous inside the text; durable prose must not require hidden context.

Name the actual subsystem, state, operation, version, contract, or decision. Define unfamiliar project-local terms before depending on them. Prefer stable headings, identifiers, versions, dates, or links over positional references such as "the section above" when the relationship must survive document edits.

A document is not self-contained merely because every sentence is grammatical. The reader must be able to reconstruct the relevant model without knowing why the author happened to write it.
