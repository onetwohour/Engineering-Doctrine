### 9.3 Keep each rule in one place

Do not scatter business rules, authorization rules, persistence policy, compatibility behavior, or validation across many callers. Place a rule at the concept that owns it.

Prefer one coherent rule over unrelated exceptions; one source of truth over synchronized copies; explicit ownership over shared ambiguity; enforced invariants over repeated repair; clear contracts over reaching into internals.
