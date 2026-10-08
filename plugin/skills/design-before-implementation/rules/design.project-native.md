### 9.10 Make engineering artifacts native to the project

A good implementation should look as though a competent maintainer who understands this repository and domain made the choices deliberately — not like a generic reference implementation transplanted into it.

Before choosing naming, layering, abstractions, error models, configuration shape, test structure, file decomposition, or dependency patterns, learn the project's local grammar where it is sound: existing ownership boundaries, terminology, composition style, error handling, lifecycle, persistence model, testing idioms, and public conventions. Preserve meaningful local identity; do not normalize a distinct system into the generator's preferred architecture.

Local convention is evidence, not authority. Do not cargo-cult broken patterns merely to blend in. When a local pattern conflicts with ownership, invariants, safety, or the requested outcome, fix the underlying model rather than copying either the local defect or a fashionable external pattern.

Reject choices justified only by phrases such as "standard architecture," "best practice," "cleaner pattern," or "more professional" when no concrete property of this system requires them. The relevant question is not whether a pattern is common; it is what problem it solves here and what complexity it removes or prevents.

---
