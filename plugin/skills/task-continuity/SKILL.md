---
name: task-continuity
description: Preserves safe orientation across long work, failures, context loss, compaction, and explicit run budgets while keeping the goal stable and discarded hypotheses discarded. Applies to long, multi-stage, delegated, or attention-sensitive work; failed attempts, apparent blockers, tool friction, and repeated failure; durable task-state decisions; re-entry after breaks, context loss, uncertainty, or unexplained state; context compaction; or owner-defined execution budgets.
user-invocable: false
---

## Responsibility

Preserves safe orientation across long work, failures, context loss, compaction, and explicit run budgets while keeping the goal stable and discarded hypotheses discarded.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [core.md](${CLAUDE_SKILL_DIR}/core.md) — **long, multi-stage, delegated, or attention-sensitive work.** Canonical trigger: a task is long or multi-stage, delegation or accumulated state makes attention management material, or context continuity itself affects safe execution.
- [persistence.md](${CLAUDE_SKILL_DIR}/persistence.md) — **failed attempts, apparent blockers, tool friction, and repeated failure.** Canonical trigger: an attempt fails, work appears blocked, tool friction or unfamiliarity impedes progress, or the same approach is failing repeatedly.
- [durable-state.md](${CLAUDE_SKILL_DIR}/durable-state.md) — **durable task-state decisions.** Canonical trigger: durable task state is needed before a second material stage, after re-entry or compaction, for an owner-level decision, when later work depends on earlier decisions, or when accumulated changes make intent unsafe to reconstruct from the diff alone.
- [reentry.md](${CLAUDE_SKILL_DIR}/reentry.md) — **re-entry after breaks, context loss, uncertainty, or unexplained state.** Canonical trigger: returning after a break, restart, session change, context loss, uncertainty, or unexplained state.
- [compaction.md](${CLAUDE_SKILL_DIR}/compaction.md) — **context compaction.** Canonical trigger: context compaction is imminent or has occurred.
- [budgets.md](${CLAUDE_SKILL_DIR}/budgets.md) — **owner-defined execution budgets.** Canonical trigger: the owner states limits on tokens, time, tool calls, memory, cost, or other execution resources.
