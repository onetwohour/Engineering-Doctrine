---
name: documentation
description: Writing or updating a README, architecture note, runbook, guide, changelog, or an agent instruction file such as CLAUDE.md or a scoped rule. Read this doctrine BEFORE writing or reviewing project documentation or instructions.
---

## Responsibility

Keeps durable documentation serving a cold reader and current truth, and keeps agent-facing instruction files scoped to what actually needs loading.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Writing or updating a README, architecture note, runbook, guide, changelog, or an agent instruction file such as CLAUDE.md or a scoped rule

Canonical trigger: permanent or generated documentation, or an agent-facing instruction file, is meaningfully changed or reviewed.

- [documentation.core](rules/documentation.core.md) — Documentation
- [documentation.cold-reader](rules/documentation.cold-reader.md) — Write for a cold reader
- [documentation.current-truth](rules/documentation.current-truth.md) — Describe current truth before change history
- [documentation.task-state-transform](rules/documentation.task-state-transform.md) — Transform task state; never publish it by copy
- [documentation.durable-prose](rules/documentation.durable-prose.md) — Durable prose is legitimate when it owns real knowledge
- [documentation.agent-instructions](rules/documentation.agent-instructions.md) — Instructions to an agent are documentation with a load rule
