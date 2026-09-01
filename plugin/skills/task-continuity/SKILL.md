---
name: task-continuity
description: Preserves safe orientation across long work, failures, context loss, compaction, and explicit run budgets while keeping the goal stable and discarded hypotheses discarded. Applies to long or multi-stage work where delegation and accumulated state make attention management matter; a failed attempt, work that looks blocked, or an approach that keeps failing; deciding whether to record durable task state that must survive context loss; returning after a break, restart, or context loss, or finding changes you cannot explain; imminent or just-completed context compaction; or an owner-stated limit on tokens, time, tool calls, cost, or other execution resources.
user-invocable: false
---

## Responsibility

Preserves safe orientation across long work, failures, context loss, compaction, and explicit run budgets while keeping the goal stable and discarded hypotheses discarded.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [core.md](${CLAUDE_SKILL_DIR}/core.md) — **long or multi-stage work where delegation and accumulated state make attention management matter.** Canonical trigger: a task is long or multi-stage, delegation or accumulated state makes attention management material, or context continuity itself affects safe execution.
- [persistence.md](${CLAUDE_SKILL_DIR}/persistence.md) — **a failed attempt, work that looks blocked, or an approach that keeps failing.** Canonical trigger: an attempt fails, work appears blocked, tool friction or unfamiliarity impedes progress, or the same approach is failing repeatedly.
- [durable-state.md](${CLAUDE_SKILL_DIR}/durable-state.md) — **deciding whether to record durable task state that must survive context loss.** Canonical trigger: durable task state is needed before a second material stage, after re-entry or compaction, for an owner-level decision, when later work depends on earlier decisions, or when accumulated changes make intent unsafe to reconstruct from the diff alone.
- [reentry.md](${CLAUDE_SKILL_DIR}/reentry.md) — **returning after a break, restart, or context loss, or finding changes you cannot explain.** Canonical trigger: returning after a break, restart, session change, context loss, uncertainty, or unexplained state.
- [compaction.md](${CLAUDE_SKILL_DIR}/compaction.md) — **imminent or just-completed context compaction.** Canonical trigger: context compaction is imminent or has occurred.
- [budgets.md](${CLAUDE_SKILL_DIR}/budgets.md) — **an owner-stated limit on tokens, time, tool calls, cost, or other execution resources.** Canonical trigger: the owner states limits on tokens, time, tool calls, memory, cost, or other execution resources.
