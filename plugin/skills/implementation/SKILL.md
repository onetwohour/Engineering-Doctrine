---
name: implementation
description: Writing or changing executable behavior, configuration, or data handling, including one-line and trivial edits, or code that acquires a resource; adding a new type, module, helper, service, adapter, validator, error type, config mechanism, or abstraction that may already exist; or writing, expanding, or reviewing a source comment, docstring, or API documentation comment. Read this doctrine BEFORE writing code, configuration, data handling, or source comments.
---

## Responsibility

Implements the chosen design while preserving established contracts, data, and behavior, binds each acquired resource to an owner and a guaranteed release, keeps source comments exceptional rather than a parallel narration layer, and returns to the model when implementation evidence contradicts it.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Writing or changing executable behavior, configuration, or data handling, including one-line and trivial edits, or code that acquires a resource

Canonical trigger: implementing or changing executable behavior, configuration, data handling, or generated implementation artifacts, including trivial changes.

- [scope.root-cause](rules/scope.root-cause.md) — Scope and root cause
- [workflow.implement](rules/workflow.implement.md) — Implementation
- [design.resource-lifetime](rules/design.resource-lifetime.md) — Bind every resource to an owner and a release
### Cue: Adding a new type, module, helper, service, adapter, validator, error type, config mechanism, or abstraction that may already exist

Canonical trigger: introducing a new type, module, helper, utility, service, repository, adapter, parser, serializer, validator, error type, configuration mechanism, or architectural abstraction.

- [design.reuse-before-adding](rules/design.reuse-before-adding.md) — Find the existing owner before adding a concept
### Cue: Writing, expanding, or reviewing a source comment, docstring, or API documentation comment

Canonical trigger: source comments, docstrings, or API documentation comments are meaningfully changed or reviewed.

- [comments.core](rules/comments.core.md) — Comments
- [comments.api-contract](rules/comments.api-contract.md) — Documentation comments
- [comments.review](rules/comments.review.md) — Comment review
