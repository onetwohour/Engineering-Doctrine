---
name: task-continuity
description: Long or multi-stage work where delegation and accumulated state make attention management matter; a failed attempt, work that looks blocked, or an approach that keeps failing; deciding whether to record durable task state that must survive context loss; returning after a break, restart, or context loss, or finding changes you cannot explain; imminent or just-completed context compaction; or an owner-stated limit on tokens, time, tool calls, cost, or other execution resources. Read this doctrine BEFORE continuing work across interruption, failure, compaction, or budget pressure.
---

## Responsibility

Preserves safe orientation across long work, failures, context loss, compaction, and explicit run budgets while keeping the goal stable and discarded hypotheses discarded.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: A failed attempt, work that looks blocked, or an approach that keeps failing

Canonical trigger: an attempt fails, work appears blocked, tool friction or unfamiliarity impedes progress, or the same approach is failing repeatedly.

- [judgment.persistence](rules/judgment.persistence.md) — Persistence without stubbornness
### Cue: Long or multi-stage work where delegation and accumulated state make attention management matter

Canonical trigger: a task is long or multi-stage, delegation or accumulated state makes attention management material, or context continuity itself affects safe execution.

- [continuity.core](rules/continuity.core.md) — Context and continuity
### Cue: Deciding whether to record durable task state that must survive context loss

Canonical trigger: durable task state is needed before a second material stage, after re-entry or compaction, for an owner-level decision, when later work depends on earlier decisions, or when accumulated changes make intent unsafe to reconstruct from the diff alone.

- [continuity.durable-state](rules/continuity.durable-state.md) — Durable task state
### Cue: Returning after a break, restart, or context loss, or finding changes you cannot explain

Canonical trigger: returning after a break, restart, session change, context loss, uncertainty, or unexplained state.

- [continuity.tripwires](rules/continuity.tripwires.md) — Trip-wires
- [continuity.reentry](rules/continuity.reentry.md) — Re-entry
### Cue: Imminent or just-completed context compaction

Canonical trigger: context compaction is imminent or has occurred.

- [continuity.compaction](rules/continuity.compaction.md) — When context is compacted
### Cue: An owner-stated limit on tokens, time, tool calls, cost, or other execution resources

Canonical trigger: the owner states limits on tokens, time, tool calls, memory, cost, or other execution resources.

- [continuity.run-budgets](rules/continuity.run-budgets.md) — Run budgets
