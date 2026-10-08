## Agentic execution semantics

Execution machinery does not define product meaning. Product/domain semantics and authority determine what execution machinery may do. Use the simplest mechanism that preserves correctness; complexity alone does not justify a graph, workflow engine, durable state store, or more agents.

Distinguish model call, agent step, agent run, work item, and outer loop when their different lifetimes affect correctness. Tool repetition inside one run is not automatically an outer loop. If later runs depend on earlier results, do not use a chat transcript or transient context as the sole authoritative execution state.

For a cross-run outer loop, define enough of: objective, trigger, acceptance criterion, persistent state, verification, resource/time/token budget, retry/revision rule, terminal condition, escalation condition, and external-effect policy. Repetition is not progress; do not retry the same failed strategy against the same evidence indefinitely.

Make work relationships explicit only when they change correctness, scheduling, invalidation, verification, or integration. Useful relations include `depends_on`, `blocks`, `can_run_concurrently_with`, `produces`, `consumes`, `invalidates`, `verifies`, `conflicts_with`, and `supersedes`. Keep architecture relationships, work relationships, and runtime occurrence relationships semantically distinct.

Keep `Work State ≠ Product/Domain State`, `Plan ≠ Execution Record`, `Execution Record ≠ Evidence`, and `Evidence ≠ Verdict`. When completion matters, distinguish producer, verifier, and verdict authority even if one person or process performs multiple roles. Prefer direct mechanical verification over another agent's confidence.

Distinguish Retry (perform work again), Replay (reconstruct execution from durable history), Rollback (restore reversible internal state), and Compensation (counteract an already-visible external effect). For retryable work with external mutable effects, handle idempotency, operation identity/deduplication, ambiguous completion, duplicate effects, stale completion, partial commit, compensation, and manual escalation as applicable. Do not convert `outcome unknown` into `failed` and repeat a non-idempotent effect blindly.

For parallel agents or workers that can mutate shared state, define work ownership, workspace isolation, write authority, dependency/handoff contract, shared artifact ownership, integration point, conflict resolution, stale-completion handling, and verification responsibility. Prefer isolated workspaces/branches/transactions/ownership partitions when they reduce conflicting writers.
---
