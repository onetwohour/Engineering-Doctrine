---
name: design-before-implementation
description: Tracing a bug, failure, or unexpected behavior to its actual cause and entry point; working out what owns which state, with its invariants, lifecycle, boundaries, and failure semantics; choosing a domain model, ownership, contract, abstraction, or architecture before writing code; adding a branch, flag, mode, setting, exception, special case, magic value, or hardcoded path; moving code between components, changing dependency direction, or widening a contract; or refactoring, consolidating duplicated authority, or deleting an obsolete path. Read this doctrine BEFORE settling cause, ownership, contract, or structural design.
---

## Responsibility

Establishes causal understanding, explicit ownership and invariants, and a coherent design before implementation rather than turning symptoms into architecture.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Tracing a bug, failure, or unexpected behavior to its actual cause and entry point

Canonical trigger: establishing behavior, cause, entry point, data flow, or failure path.

- [workflow.understand](rules/workflow.understand.md) — Understand before changing
### Cue: Working out what owns which state, with its invariants, lifecycle, boundaries, and failure semantics

Canonical trigger: reasoning about ownership, state, invariants, lifecycle, dependencies, boundaries, or failure semantics.

- [workflow.model](rules/workflow.model.md) — Model the system
### Cue: Choosing a domain model, ownership, contract, abstraction, or architecture before writing code

Canonical trigger: choosing or changing domain model, ownership, abstractions, contracts, or architecture.

- [design.core](rules/design.core.md) — Design before implementation
- [design.domain-not-diagram](rules/design.domain-not-diagram.md) — Design the domain, not the diagram
- [design.invalid-states](rules/design.invalid-states.md) — Make invalid states hard to represent
- [design.single-rule-owner](rules/design.single-rule-owner.md) — Keep each rule in one place
- [design.human-cost](rules/design.human-cost.md) — Human cost is part of design
### Cue: Adding a branch, flag, mode, setting, exception, special case, magic value, or hardcoded path

Canonical trigger: changing branches, flags, modes, settings, exceptions, identities, magic values, or hardcoded paths.

- [design.control-paths](rules/design.control-paths.md) — Control paths and fixed values
### Cue: Moving code between components, changing dependency direction, or widening a contract

Canonical trigger: changing cohesion, component boundaries, dependency direction, or contracts.

- [design.cohesion](rules/design.cohesion.md) — Cohesion, coupling, and component size
- [design.dependency-direction](rules/design.dependency-direction.md) — Dependency direction and domain independence
- [design.narrow-contracts](rules/design.narrow-contracts.md) — Narrow contracts
### Cue: Refactoring, consolidating duplicated authority, or deleting an obsolete path

Canonical trigger: deleting obsolete paths, consolidating authority, or refactoring.

- [design.refactoring](rules/design.refactoring.md) — Deletion and refactoring
### Cue: Choosing a domain model, ownership, contract, abstraction, or architecture before writing code

Canonical trigger: choosing or changing domain model, ownership, abstractions, contracts, or architecture.

- [design.project-native](rules/design.project-native.md) — Make engineering artifacts native to the project
