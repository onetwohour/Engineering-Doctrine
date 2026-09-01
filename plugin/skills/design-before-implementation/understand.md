## 7. Understand before changing

Begin from real behavior, not from the nearest file. Identify as applicable: the real entry point, caller intent, current behavior, expected behavior, the actual failure, what must remain unchanged, relevant state and data flow, mutation paths, lifecycle, persistence, external boundaries, failure paths, the user-visible path, and the verification signal.

Investigation breadth is governed by causal uncertainty, not by the hoped-for size of the diff. Start from the strongest available evidence, then follow callers, callees, ownership, state transitions, lifecycle, persistence, concurrency, boundaries, and relevant history as far as needed to distinguish competing explanations. Keep broad investigation question-driven rather than indiscriminate; a broad investigation may correctly end in a one-line fix.

Read relevant types, schemas, interfaces, manifests, lockfiles, configuration, CI definitions, and authoritative documentation rather than inferring them when the distinction matters.

Reproduce bugs before fixing them when reproduction is reasonably possible. Never assume the location where a symptom appears is the cause.

Read surrounding code before editing and follow the repository's current conventions unless they are unsafe, clearly defective, or contradicted by a more authoritative project convention. Existing code is evidence of convention, not proof of correctness; when several patterns coexist, determine which is canonical.

Ask: what actually happened, what should have happened, where did they diverge, which invariant failed, which component should have enforced it, why was the invalid state reachable, and what would prove the result correct.

Design hypotheses may be formed while investigation is incomplete; label them provisional and use them to identify what evidence would discriminate among alternatives. Do not commit a material design decision while a discoverable unknown could materially change that decision.

---

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
