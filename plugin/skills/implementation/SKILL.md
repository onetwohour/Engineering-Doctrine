---
name: implementation
description: Invoke this Doctrine skill when current work involves writing or changing executable behavior, configuration, or data handling, including small and trivial edits; or adding a new type, module, helper, service, adapter, validator, error type, config mechanism, or abstraction that may already exist.
user-invocable: false
---

## Responsibility

Implements the chosen design while preserving established contracts, data, and behavior, and returns to the model when implementation evidence contradicts it.

This summary is discovery orientation only; the canonical rule projection below carries the binding requirements.

## 10. Scope and root cause

Fix the root cause at the narrowest **correct** level. "Smallest coherent implementation" means the least unnecessary breadth that still fully delivers the requested outcome and fixes the cause — not the fewest edited lines or the smallest coherent subset. Narrow scope never licenses partial delivery.

**Investigation scope, solution-search scope, and mutation scope are different.** Keep mutation no broader than causality and the requested outcome require, but investigate broadly enough to establish the cause and consider alternatives broadly enough to avoid premature fixation. "Narrow scope" does not mean "inspect only nearby code," "assume the symptom is local," or "consider only local fixes." Expand along real causal paths until the model is supported by evidence; only then contract the change. A small diff is a possible result of broad understanding, not a constraint imposed before understanding.

If the cause is wrong ownership, duplicated policy, missing validation, a missing invariant, an incorrect lifecycle, or a broken general rule — fix that cause across as many files as required. Do not patch only where the symptom appears if that preserves the underlying defect.

Equally: **if investigation establishes that ownership, boundaries, invariants, and the domain model are already correct and the defect is truly local, fix it locally.** Do not invent a deeper architectural cause merely because one can be imagined. Local bugs are allowed to be local.

```text
"Fix the duplicate charge on payment retry."
Cause: retry path and webhook handler both write order.status; no owner.
✓ Give status one owner; route both paths through it — four files.
✗ if order.status == "paid": return    three lines that preserve the defect.

"Fix the date shown as 'Jan 32' in the export."
Cause: off-by-one in one formatter; ownership and model already correct.
✓ Fix the line. Add the regression test.
✗ Redesign the export pipeline the bug "reveals."

```

Correct scope is determined by causality — not by line count, and not by a preference for architectural change.

---

## 13. Implementation

Implement the chosen design faithfully. Preserve existing public APIs, stored data, formats, configuration, preferences, integrations, workflows, and user interaction patterns unless changing them is required by the task.

Never ship placeholder behavior as real. Do not present as complete: hardcoded success values, dummy business logic, production branches that exist only for tests, fabricated realistic data, no-op integrations presented as functioning, or temporary code presented as finished.

Challenge the implementation against the failure dimensions that are material to its model. As applicable, consider malformed or empty input, boundary values, concurrent access, ordering, cancellation, retry, duplicate delivery, partial failure, persistence or commit failure, external side effects, restart, rollback, and recovery. This is a seed list, not a mandatory checklist; follow the actual state machine, boundaries, and risks.

When multiple paths can mutate the same state, identify who owns the decision and which transition wins. If a material race, failure transition, or recovery state cannot be explained, the implementation is not ready to be treated as complete.

If implementation exposes evidence that invalidates the design, return to the earliest affected stage and correct the model rather than accumulating patches around the contradiction.

---

### 13.1 Find the existing owner before adding a concept

Before introducing a new type, module, helper, utility, service, repository, adapter, parser, serializer, validator, error type, configuration mechanism, or architectural abstraction, search for the concept and behavior already present in the repository — not only the name you intend to use. If overlapping implementations exist, determine the canonical owner before adding another. A new abstraction needs a clear responsibility, owner, and reason it cannot be expressed by an existing concept without making that concept less coherent.

---
