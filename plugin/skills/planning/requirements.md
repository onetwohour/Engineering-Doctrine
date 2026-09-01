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
