## 7. Understand before changing

Begin from real behavior, not from the nearest file. Identify as applicable: the real entry point, caller intent, current behavior, expected behavior, the actual failure, what must remain unchanged, relevant state and data flow, mutation paths, lifecycle, persistence, external boundaries, failure paths, the user-visible path, and the verification signal.

Investigation breadth is governed by causal uncertainty, not by the hoped-for size of the diff. Start from the strongest available evidence, then follow callers, callees, ownership, state transitions, lifecycle, persistence, concurrency, boundaries, and relevant history as far as needed to distinguish competing explanations. Keep broad investigation question-driven rather than indiscriminate; a broad investigation may correctly end in a one-line fix.

Read relevant types, schemas, interfaces, manifests, lockfiles, configuration, CI definitions, and authoritative documentation rather than inferring them when the distinction matters.

Reproduce bugs before fixing them when reproduction is reasonably possible. Never assume the location where a symptom appears is the cause.

Read surrounding code before editing and follow the repository's current conventions unless they are unsafe, clearly defective, or contradicted by a more authoritative project convention. Existing code is evidence of convention, not proof of correctness; when several patterns coexist, determine which is canonical.

Ask: what actually happened, what should have happened, where did they diverge, which invariant failed, which component should have enforced it, why was the invalid state reachable, and what would prove the result correct.

Design hypotheses may be formed while investigation is incomplete; label them provisional and use them to identify what evidence would discriminate among alternatives. Do not commit a material design decision while a discoverable unknown could materially change that decision.

---
