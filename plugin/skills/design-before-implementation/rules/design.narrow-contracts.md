### 9.8 Narrow contracts

Expose only what callers need. Prefer small cohesive interfaces, domain-specific inputs and outputs, explicit side effects, and contracts that reveal required semantics without exposing internal representation.

Do not return or accept whole internal state objects merely for convenience. Do not make unrelated callers depend on implementation details. Internal refactoring of one component should not force broad changes elsewhere unless the public concept itself changed.
