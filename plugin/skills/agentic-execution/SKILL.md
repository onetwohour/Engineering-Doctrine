---
name: agentic-execution
description: Coordinating multiple runs or agents, durable execution, retries, work graphs, shared mutation, or external side effects. Read this doctrine BEFORE coordinating correctness across multiple runs, workers, or retries.
---

## Responsibility

Separates work state from product truth and makes multi-run execution, verification, retries, external effects, concurrency, and termination explicit without turning orchestration into architecture.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Coordinating multiple runs or agents, durable execution, retries, work graphs, shared mutation, or external side effects

Canonical trigger: correctness spans multiple agent runs, workers, durable execution state, explicit work dependencies, retries or replays, shared mutable workspaces, or external side effects that may outlive one attempt.

- [agentic.execution](rules/agentic.execution.md) — Agentic execution semantics
