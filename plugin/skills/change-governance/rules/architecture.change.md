## Architecture change protocol

An ARCHITECTURE_CHANGE is determined by semantic meaning and authority, not diff size. Do not rerun a whole bootstrap by default; reopen only the changed semantic and its direct impact surface.

Before implementation:

1. Re-establish the requirement and exact change scope.
2. Establish the CURRENT effective canonical/de-facto/public/persisted contract and the evidence for it.
3. Check whether an existing extension point can express the requirement without changing authority or semantic law.
4. State why the current structure cannot represent the requirement correctly.
5. Choose the minimum semantic, authority, ownership, lifecycle, or boundary change that resolves that reason.
6. Trace affected callers, callees, state, persistence, serialization, security, tests, operations, and compatibility.
7. Re-close semantic-definition ownership, runtime/mutation authority, source of record, implementation home, public boundary, and dependency direction for the affected scope.
8. Update the effective specification/architecture/contract and decision record only where their owned truth actually changes.
9. Challenge the target with relevant counterexamples.
10. Decide whether migration, compatibility, rollout, runtime activation, or rollback/forward-fix semantics are required.
11. Implement and verify regression behavior.
12. Confirm TARGET conformance separately from the authority that CURRENT runtime still uses. After cutover, confirm artifact role/status, runtime activation, and retirement of obsolete paths.

Architecture smells that require investigation include independent writers for the same semantic state, a second current/source-of-truth authority, parallel identity systems, feature-local retry/recovery authorities for the same law, storage internals leaking upward repeatedly, stale workers able to overwrite current state, global managers owning unrelated truth, independently evolving duplicate concept types, and the same workaround spreading across subsystems. A single local exception is evidence, not proof of a global defect.
---
