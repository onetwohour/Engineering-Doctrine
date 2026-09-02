---
name: design-before-implementation
description: Invoke this Doctrine skill when current work involves tracing a bug, failure, or unexpected behavior back to its actual cause and entry point; working out what owns which state, and its invariants, lifecycle, boundaries, and failure semantics; choosing a domain model, ownership, contract, abstraction, or architecture before writing code; adding a branch, flag, mode, setting, exception, special case, magic value, or hardcoded path; moving code between components, changing dependency direction, or widening a contract; or refactoring, consolidating duplicated authority, or deleting an obsolete path.
user-invocable: false
---

## Responsibility

Establishes causal understanding, explicit ownership and invariants, and a coherent design before implementation rather than turning symptoms into architecture.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [understand.md](${CLAUDE_SKILL_DIR}/understand.md) — **tracing a bug, failure, or unexpected behavior back to its actual cause and entry point.** Canonical trigger: establishing behavior, cause, entry point, data flow, or failure path.
- [model.md](${CLAUDE_SKILL_DIR}/model.md) — **working out what owns which state, and its invariants, lifecycle, boundaries, and failure semantics.** Canonical trigger: reasoning about ownership, state, invariants, lifecycle, dependencies, boundaries, or failure semantics.
- [design-core.md](${CLAUDE_SKILL_DIR}/design-core.md) — **choosing a domain model, ownership, contract, abstraction, or architecture before writing code.** Canonical trigger: choosing or changing domain model, ownership, abstractions, contracts, or architecture.
- [control-paths.md](${CLAUDE_SKILL_DIR}/control-paths.md) — **adding a branch, flag, mode, setting, exception, special case, magic value, or hardcoded path.** Canonical trigger: changing branches, flags, modes, settings, exceptions, identities, magic values, or hardcoded paths.
- [structure.md](${CLAUDE_SKILL_DIR}/structure.md) — **moving code between components, changing dependency direction, or widening a contract.** Canonical trigger: changing cohesion, component boundaries, dependency direction, or contracts.
- [refactoring.md](${CLAUDE_SKILL_DIR}/refactoring.md) — **refactoring, consolidating duplicated authority, or deleting an obsolete path.** Canonical trigger: deleting obsolete paths, consolidating authority, or refactoring.
