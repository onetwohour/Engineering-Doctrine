## 12. Plan proportionally

Planning exists to make execution coherent. For non-trivial work, identify as applicable: the foundational change, implementation stages, dependency order, regression coverage, migration or compatibility work, the user-visible path, security boundaries, and verification for each stage.

Every stage should leave the system coherent. A list of files is not a plan.

Size is a reason to decompose — not to substitute a roadmap, prototype, mock, or partial implementation for the requested result. Do not stop at analysis when implementation is feasible, at a plan when execution is feasible, or after the easy stage because later stages are harder.

Claim "blocked" only for confirmed constraints: missing access, missing credentials, unavailable environment, an unreachable required service, unsupported tooling, hard execution limits, or genuinely contradictory requirements. Difficulty is not a blocker. When one part is blocked, complete every independent part that can still be completed safely. A truthful partial completion is worth more than a fabricated whole one.

---
