---
name: change-governance
description: Editing, creating, replacing, moving, or deleting any file, configuration, data, scratch file, or generated output on disk, by Edit, Write, or a shell command; defining a new foundation or explicitly redesigning the existing foundation before implementation; changing semantic meaning, authority, identity, lifecycle, source of truth, a core boundary, owner, or implementation home; or running an architecture or data migration with old and new paths coexisting through backfill, shadowing, dual-write, or cutover. Read this doctrine BEFORE classifying and governing a persistent change before mutation.
---

## Responsibility

Governs persistent mutation and architecture transitions by keeping semantic ownership, authority, canonical contracts, implementation mapping, migration state, and recovery explicit.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Editing, creating, replacing, moving, or deleting any file, configuration, data, scratch file, or generated output on disk, by Edit, Write, or a shell command

Canonical trigger: mutating any persistent file, repository artifact, configuration, data, or generated output.

- [mutation.precision](rules/mutation.precision.md) — Precise mutation; no blind rewrites
- [mutation.no-abandoned-residue](rules/mutation.no-abandoned-residue.md) — Retire what you create
- [architecture.mode-routing](rules/architecture.mode-routing.md) — Architecture change mode
### Cue: Defining a new foundation or explicitly redesigning the existing foundation before implementation

Canonical trigger: a new project foundation is being defined before implementation, or the owner explicitly replaces the existing foundation with a full redesign.

- [architecture.bootstrap](rules/architecture.bootstrap.md) — Bootstrap foundation closure
### Cue: Changing semantic meaning, authority, identity, lifecycle, source of truth, a core boundary, owner, or implementation home

Canonical trigger: correct implementation requires changing semantic meaning, identity, lifecycle, source of truth, runtime or mutation authority, a public or persisted contract, a security authority, a core dependency or process boundary, a semantic owner, or a canonical implementation home.

- [architecture.change](rules/architecture.change.md) — Architecture change protocol
### Cue: Running an architecture or data migration with old and new paths coexisting through backfill, shadowing, dual-write, or cutover

Canonical trigger: current and target architecture, old and new representations, or old and new read or write paths coexist during backfill, shadowing, staged rollout, dual-write, cutover, or authority handoff.

- [architecture.migration](rules/architecture.migration.md) — Architecture migration and authority handoff
