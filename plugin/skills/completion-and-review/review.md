### 26.1 Full-diff review

Reread the whole diff or equivalent changed-region evidence. Every changed file must belong to the task.

An independent reviewer without version-control execution access must receive the concrete diff or an equivalent changed-region artifact from its delegator. Do not infer what changed from current files alone.

Review in two passes:

1. **Explain** — for every material change, identify why it exists, which requested outcome or applicable rule it serves, and what behavior or state transition it changes.
2. **Falsify** — ask what concrete input, state, ordering, failure, boundary, or user interaction would show that the change is wrong.

If a material changed region cannot be explained, or a material correctness claim has no plausible falsifier or supporting evidence, the review is incomplete.

Then challenge the result from the perspectives material to the task:

- **requested outcome and scope** — did the change deliver the actual ask without unrelated work or an unjustified partial result?
- **model and ownership** — are authority, lifecycle, invariants, dependencies, and state ownership still coherent?
- **safety and reversibility** — could the change lose data, widen privilege, hide failure, or create effects that cannot be safely recovered?
- **human impact** — where a person is affected, is the result understandable, accessible, context-native, and free of implementation machinery?
- **maintainability** — did the change add duplicate policy, needless abstraction, hidden coupling, temporary behavior, or knowledge that now lives in the wrong artifact?
- **evidence** — do verification results support the claims being made, and what material uncertainty remains?

Report only gaps that affect correctness, safety, user impact, maintainability, or stated requirements. Do not invent findings to demonstrate rigor, and do not turn review into unrelated cleanup.

---
