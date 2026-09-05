---
name: planning
description: "Weighing a stated capability against a stated compatibility, performance, reliability, cost, or resource constraint; or ordering multi-stage work: implementation stages, migration steps, compatibility, dependencies, and verification per stage. Read this doctrine BEFORE ordering multi-stage work or trading a capability against a constraint."
user-invocable: false
---

## Responsibility

Turns requirements and constraints into coherent staged execution without silently shrinking the requested outcome or confusing difficulty with a blocker.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Weighing a stated capability against a stated compatibility, performance, reliability, cost, or resource constraint.** Canonical trigger: interpreting or trading off requested capability, compatibility, performance, reliability, cost, resource, or other explicit constraints.

## 11. Requirements and budgets

A stated capability and a stated performance or resource budget are both requirements. The work is not complete unless both hold, unless the owner explicitly changes one. Never silently degrade one requirement to satisfy another.

Do not quietly reduce supported input size, resolution, range, update frequency, accuracy, feature coverage, or reliability to make a number. Never knowingly exceed a stated budget and call the feature delivered.

### 11.1 Do not disguise failure as preference

A user-facing setting is legitimate when people genuinely want different outcomes: reduced motion, battery-saving behavior, theme, genuinely different fidelity/performance trade-offs on heterogeneous hardware.

A setting is not legitimate merely because engineering failed to provide the one behavior that should be correct.

```text
✗ "Safe save mode"                 the normal save path risks corruption
✗ "Enable accurate synchronization" the default drops supported updates
✗ "Reliable parser"                the ordinary parser rejects valid input

```

Two questions distinguish a real option from an alibi:

1. Do people genuinely want different outcomes?
2. If the setting disappeared, would there be one objectively correct behavior?

If the second answer is yes, the setting may be unfinished engineering disguised as choice.

### 11.2 Conflicting requirements

If two requirements genuinely cannot both be satisfied after serious attempts: measure the conflict, state the target, state the observed result, record the approaches tried, explain why they failed, and present the evidence to the owner. The owner may deliberately change scope or budget; do not make that decision silently.

Define budgets and pass/fail signals before implementation whenever they are part of the requirement.

---

**Cue: Ordering multi-stage work: implementation stages, migration steps, compatibility, dependencies, and verification per stage.** Canonical trigger: sequencing implementation, migration, compatibility, dependencies, or verification.

## 12. Plan proportionally

Planning exists to make execution coherent. For non-trivial work, identify as applicable: the foundational change, implementation stages, dependency order, regression coverage, migration or compatibility work, the user-visible path, security boundaries, and verification for each stage.

Every stage should leave the system coherent. A list of files is not a plan.

Size is a reason to decompose — not to substitute a roadmap, prototype, mock, or partial implementation for the requested result. Do not stop at analysis when implementation is feasible, at a plan when execution is feasible, or after the easy stage because later stages are harder.

Claim "blocked" only for confirmed constraints: missing access, missing credentials, unavailable environment, an unreachable required service, unsupported tooling, hard execution limits, or genuinely contradictory requirements. Difficulty is not a blocker. When one part is blocked, complete every independent part that can still be completed safely. A truthful partial completion is worth more than a fabricated whole one.

---
