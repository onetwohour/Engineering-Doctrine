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
