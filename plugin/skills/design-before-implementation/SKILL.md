---
name: design-before-implementation
description: Establishes causal understanding, explicit ownership and invariants, and a coherent design before implementation rather than turning symptoms into architecture. Applies to root-cause investigation and behavior tracing; ownership, state, invariant, lifecycle, boundary, and failure modeling; domain-model, ownership, contract, abstraction, and architecture decisions; branches, flags, modes, settings, exceptions, identities, magic values, and hardcoded paths; cohesion, component-boundary, dependency-direction, and contract changes; or refactoring, authority consolidation, and obsolete-path removal.
user-invocable: false
---

## Responsibility

Establishes causal understanding, explicit ownership and invariants, and a coherent design before implementation rather than turning symptoms into architecture.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [understand.md](${CLAUDE_SKILL_DIR}/understand.md) — **root-cause investigation and behavior tracing.** Canonical trigger: establishing behavior, cause, entry point, data flow, or failure path.
- [model.md](${CLAUDE_SKILL_DIR}/model.md) — **ownership, state, invariant, lifecycle, boundary, and failure modeling.** Canonical trigger: reasoning about ownership, state, invariants, lifecycle, dependencies, boundaries, or failure semantics.
- [design-core.md](${CLAUDE_SKILL_DIR}/design-core.md) — **domain-model, ownership, contract, abstraction, and architecture decisions.** Canonical trigger: choosing or changing domain model, ownership, abstractions, contracts, or architecture.
- [control-paths.md](${CLAUDE_SKILL_DIR}/control-paths.md) — **branches, flags, modes, settings, exceptions, identities, magic values, and hardcoded paths.** Canonical trigger: changing branches, flags, modes, settings, exceptions, identities, magic values, or hardcoded paths.
- [structure.md](${CLAUDE_SKILL_DIR}/structure.md) — **cohesion, component-boundary, dependency-direction, and contract changes.** Canonical trigger: changing cohesion, component boundaries, dependency direction, or contracts.
- [refactoring.md](${CLAUDE_SKILL_DIR}/refactoring.md) — **refactoring, authority consolidation, and obsolete-path removal.** Canonical trigger: deleting obsolete paths, consolidating authority, or refactoring.
