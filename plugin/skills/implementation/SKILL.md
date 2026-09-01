---
name: implementation
description: Implements the chosen design while preserving established contracts, data, and behavior, and returns to the model when implementation evidence contradicts it. Applies to executable behavior, configuration, data-handling, and implementation changes.
user-invocable: false
---

## Responsibility

Implements the chosen design while preserving established contracts, data, and behavior, and returns to the model when implementation evidence contradicts it.

This summary is discovery orientation only; the canonical rule projection below carries the binding requirements.

## 13. Implementation

Implement the chosen design faithfully. Preserve existing public APIs, stored data, formats, configuration, preferences, integrations, workflows, and user interaction patterns unless changing them is required by the task.

Never ship placeholder behavior as real. Do not present as complete: hardcoded success values, dummy business logic, production branches that exist only for tests, fabricated realistic data, no-op integrations presented as functioning, or temporary code presented as finished.

Challenge the implementation against the failure dimensions that are material to its model. As applicable, consider malformed or empty input, boundary values, concurrent access, ordering, cancellation, retry, duplicate delivery, partial failure, persistence or commit failure, external side effects, restart, rollback, and recovery. This is a seed list, not a mandatory checklist; follow the actual state machine, boundaries, and risks.

When multiple paths can mutate the same state, identify who owns the decision and which transition wins. If a material race, failure transition, or recovery state cannot be explained, the implementation is not ready to be treated as complete.

If implementation exposes evidence that invalidates the design, return to the earliest affected stage and correct the model rather than accumulating patches around the contradiction.

---
