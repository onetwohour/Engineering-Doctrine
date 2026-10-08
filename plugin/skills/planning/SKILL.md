---
name: planning
description: "Weighing a stated capability against a stated compatibility, performance, reliability, cost, or resource constraint; or ordering multi-stage work: implementation stages, migration steps, compatibility, dependencies, verification; or recording why a change is needed and what proves it done. Read this doctrine BEFORE ordering multi-stage work or resolving requirement trade-offs."
---

## Responsibility

Turns requirements and constraints into coherent staged execution with a stated completion proof, keeping why, what, and how as separate records, without silently shrinking the requested outcome or confusing difficulty with a blocker.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Weighing a stated capability against a stated compatibility, performance, reliability, cost, or resource constraint

Canonical trigger: interpreting or trading off requested capability, compatibility, performance, reliability, cost, resource, or other explicit constraints.

- [requirements.core](rules/requirements.core.md) — Requirements and budgets
- [requirements.no-failure-as-preference](rules/requirements.no-failure-as-preference.md) — Do not disguise failure as preference
- [requirements.conflicts](rules/requirements.conflicts.md) — Conflicting requirements
### Cue: Ordering multi-stage work: implementation stages, migration steps, compatibility, dependencies, verification; or recording why a change is needed and what proves it done

Canonical trigger: sequencing implementation, migration, compatibility, dependencies, or verification, or recording the provenance of a change.

- [workflow.plan](rules/workflow.plan.md) — Plan proportionally
- [design.change-provenance](rules/design.change-provenance.md) — Keep why, what, and how separate
