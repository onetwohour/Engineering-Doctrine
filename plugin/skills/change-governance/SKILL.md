---
name: change-governance
description: Editing, creating, replacing, moving, or deleting any file, configuration, data, scratch file, or generated output on disk, by Edit, Write, or a shell command; defining a new foundation or explicitly redesigning the existing foundation before implementation; changing semantic meaning, authority, identity, lifecycle, source of truth, a core boundary, owner, or implementation home; or running an architecture or data migration with old and new paths coexisting through backfill, shadowing, dual-write, or cutover. Read this doctrine BEFORE classifying and governing a persistent change before mutation.
---

## Responsibility

Governs persistent mutation and architecture transitions by keeping semantic ownership, authority, canonical contracts, implementation mapping, migration state, and recovery explicit.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Editing, creating, replacing, moving, or deleting any file, configuration, data, scratch file, or generated output on disk, by Edit, Write, or a shell command.** Canonical trigger: mutating any persistent file, repository artifact, configuration, data, or generated output.

### 3.7 Precise mutation; no blind rewrites

Every mutation must be scoped to the intended artifact and meaning. A tool being capable of changing text does not make it the right editing primitive.

Use the narrowest available mutation mechanism that directly expresses the intended change. In Claude Code, a targeted change to an existing file normally belongs in `Edit`; creating or intentionally replacing a whole file belongs in `Write`. `Bash`, shell text processors, and general-purpose scripts are execution mechanisms, not the default editor. The same principle applies in other environments: prefer a dedicated file, patch, syntax-aware, schema-aware, or generator interface over an opaque command pipeline when it can express the change more precisely.

Do not use `sed`, Perl, Python, shell loops, regex scripts, or similar one-off rewriting merely to avoid a precise edit operation. Do not rewrite an entire file to change a local region when a targeted edit can preserve the rest exactly.

A multi-match replacement or scripted rewrite is legitimate only when the transformation is genuinely mechanical and the target set is proven before mutation. Inspect or enumerate the affected files and occurrences; establish the expected match count or other exact selection criterion; verify that every selected occurrence has the same intended semantics. Identical text does not imply identical meaning. If the count or target set is unexpected, stop rather than widening the replacement until it happens to work.

Prefer the authoritative generator, formatter, AST/CST transform, schema migration, or language-aware refactoring tool when the artifact already has one. Broad raw-text replacement must not substitute for a semantic transform when syntax or context determines meaning.

After mutation, inspect what actually changed. Re-read the changed region or artifact and, when version control or an equivalent diff is available, inspect the diff for unintended files, occurrences, formatting, encoding, or line-ending changes. A command exiting successfully proves only that the command ran; it does not prove the intended edit occurred.

When version control, snapshots, or equivalent rollback are unavailable, mutation authority becomes narrower, not broader. Before a multi-file, whole-file, or bulk mechanical rewrite, establish a recoverable baseline using the environment's available snapshot, undo, backup, or equivalent mechanism. If no recoverable baseline can be established, decompose the work into small, individually inspected edits whose original state is known well enough to restore. Never rely on "we can inspect it afterward" when the pre-edit state would be lost.

---

### 3.8 Retire what you create

Creating something for your own execution creates the obligation to end its life. Scratch scripts, temporary files, intermediate outputs, generated fixtures, backup copies, working branches and stashes, and background processes are yours to retire.

Decide where each one lives before creating it. When the environment designates a scratch or temporary location outside the owner's project, put it there and the obligation ends with the session. Anything written inside the owner's project or working tree is retired when the task ends, unless it survives as a deliberate deliverable the owner has been told about.

Retire only what this task created. Pre-existing files, unexplained working-tree changes, and another task's artifacts fall under `safety.no-silent-destruction` and are not yours to sweep up.

Account for the residue before reporting completion: what was removed, what remains, and why it remains. A stray file the owner finds later is a defect, not a detail.

---

## Architecture change mode

Before the first persistent mutation, classify the work from current evidence. The classification governs how much design must be closed before implementation:

```text
BOOTSTRAP
    A new foundation is being defined before production implementation, or the owner explicitly replaces the existing foundation.

NORMAL_DEVELOPMENT
    The requested behavior can be implemented correctly inside the current semantic contracts, owners, authorities, lifecycle, and dependency boundaries. This is the default for an existing project.

ARCHITECTURE_CHANGE
    Correct implementation requires changing semantic meaning, identity/equality, lifecycle, source of truth, runtime or mutation authority, a public or persisted contract, security authority, a core dependency/process boundary, a semantic-definition owner, or a canonical implementation home.

MIGRATION
    A modifier on an architecture change when CURRENT and TARGET or old and new representations/paths coexist before cutover is complete.
```

Missing architecture documents, old code, technical debt, an imperfect structure, or the absence of a registry do not by themselves justify BOOTSTRAP. During NORMAL_DEVELOPMENT, stop accumulating local patches and reclassify before continuing if the change requires a new or shadow source of truth, competing authority, a changed identity law, a lifecycle the current model cannot express, a violated core dependency direction, or the same workaround in multiple places.

Physical structure follows semantic structure. Do not start a foundation decision by naming packages, managers, services, repositories, tables, or directories. For each foundation-significant semantic, distinguish as applicable: semantic-definition owner, runtime authority, mutation authority, source of record, read-model owner, canonical implementation home, and public boundary. Different representations are allowed; competing semantic authority is not.

Do not turn an unresolved product policy into an engineering preference. If multiple correctness-valid choices produce different observable behavior and requirements do not choose among them, classify it as `UNSPECIFIED_PRODUCT_POLICY`. Use these defect classes when useful: `IMPLEMENTATION_DEFECT`, `LOCAL_DESIGN_DEFECT`, `ARCHITECTURE_DEFECT`, `SPEC_DEFECT`, `SPEC_GAP`, `UNSPECIFIED_PRODUCT_POLICY`, `INSUFFICIENT_EVIDENCE`. Do not fill a specification gap or evidence gap by guessing.
---

**Cue: Defining a new foundation or explicitly redesigning the existing foundation before implementation.** Canonical trigger: a new project foundation is being defined before implementation, or the owner explicitly replaces the existing foundation with a full redesign.

## Bootstrap foundation closure

In BOOTSTRAP, close the foundation before production implementation. Use this order as a dependency order, not as a demand for documents or ceremony:

`product intent → existing evidence → system invariants → semantic decomposition → ownership/authority → canonical contracts → identity/state/lifecycle → applicable persistence/concurrency/failure/security semantics → dependency direction → runtime/process boundaries → physical implementation ownership → enforceable boundaries → counterexample validation → implementation stages → readiness`

Treat a semantic or boundary as foundation-significant when one or more of these materially affect correctness: it constrains multiple subsystems; appears in a public or persisted contract; supplies identity for other state; needs runtime/mutation/source-of-record authority; has a lifecycle that changes other work; carries durable persistence/concurrency/security/failure semantics; determines broad dependency or ownership direction; or would require migration or widespread caller rewrites if changed later. Do not inventory private helpers or replaceable local representations merely to fill a template.

Close product intent only to the level needed to choose correct semantics: purpose, non-goals, users, authoritative truth, unacceptable failures, identity-defining quality attributes, and external compatibility or operational constraints. Existing implementation is evidence of current behavior, not automatic authority for the new foundation. Trace architecture-critical claims far enough to establish the real path, including definition, construction, writers, readers, exports, callers, persistence, and recovery where relevant.

A filename does not make an artifact canonical. For any artifact relied on as normative truth, establish enough of its identity, semantic scope, status (`draft/candidate/effective/superseded` or equivalent), current/target role when applicable, authority, version/freshness, and supersession relationship to know what claim it can decide. Two incompatible effective artifacts for the same scope are a specification defect unless evidence shows different scope or supersession; uncertain authority remains `INSUFFICIENT_EVIDENCE`.

For each foundation-significant semantic, close as applicable:

- identity/equality and canonical representation
- owner and authority roles, including mutation authority and source of record
- state, lifecycle, legal transitions, currentness, and ordering
- atomicity, visibility, failure, cancellation, retry/idempotency, replay, stale completion
- persistence, crash recovery, migration/reconfiguration, serialization/versioning
- concurrency, authorization/security, external protocol behavior, observability
- resource ownership/cleanup and any performance property that changes correctness
- canonical implementation home, public boundary, and allowed/forbidden dependencies

A semantic is not closed when two competent independent implementers can choose different behavior that changes correctness or an observable contract.

Validate important contracts with counterexamples, not only happy paths: create/delete/recreate; start/cancel; retry after ambiguous outcome; stale completion; concurrent readers/writers; crash before and after publication; conflicting writers; policy tightening; complete versus partial coverage; migration/restart; external success with local persistence failure; local commit with acknowledgement loss; and replay of a non-idempotent effect where applicable.

`IMPLEMENTATION_READY` is a scoped verdict over a particular architecture meaning or revision, not a permanent badge. Before recording it, close product policy, core semantics, authority, physical ownership, applicable operational semantics, evidence, counterexamples, and implementation-stage mapping. Distinguish an assessor's opinion from the designated verdict authority and from the canonical readiness state stored in the project's authorized architecture/status artifact. A readiness verdict for architecture A or scope X does not automatically transfer to architecture B or scope Y.
---

**Cue: Changing semantic meaning, authority, identity, lifecycle, source of truth, a core boundary, owner, or implementation home.** Canonical trigger: correct implementation requires changing semantic meaning, identity, lifecycle, source of truth, runtime or mutation authority, a public or persisted contract, a security authority, a core dependency or process boundary, a semantic owner, or a canonical implementation home.

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

**Cue: Running an architecture or data migration with old and new paths coexisting through backfill, shadowing, dual-write, or cutover.** Canonical trigger: current and target architecture, old and new representations, or old and new read or write paths coexist during backfill, shadowing, staged rollout, dual-write, cutover, or authority handoff.

## Architecture migration and authority handoff

Steady state has one canonical semantic definition and an unambiguous authority path. Migration may temporarily contain multiple representations and paths, but it must not silently create competing semantic authority.

Keep these roles distinct when they coexist:

```text
CURRENT      contract that interprets running/public/persisted behavior now
TARGET       approved contract that becomes current after the change is activated
HISTORICAL   superseded record with no current or target decision authority
```

Normative document status, semantic role (`current/target`), implementation conformance, and runtime activation are separate axes. An approved or merged TARGET does not mean the runtime has cut over; a file rename or branch merge is not an authority handoff.

For old/new representation, backfill, shadow read/write, staged rollout, bridge, controlled dual-write, or read/write cutover, close as applicable:

- migration objective and effective phase/state
- CURRENT and TARGET contract for each phase
- semantic authority and mutation authority
- authoritative read path and crash/restart source of record
- purpose and non-authoritative status of shadow/secondary representations
- partial-success, ordering, retry, idempotency, and ambiguous-outcome semantics for replication or dual-write
- reconciliation when representations diverge
- equivalence/completeness/correctness verification before cutover
- cutover condition and the exact authority/read/write handoff
- rollback boundary and the point after which forward-fix, compensation, or another migration is required
- stale completion, acknowledgement loss, partial commit, duplicate effect, and unknown-outcome handling
- observability for divergence, lag, duplicate effects, and failed backfill
- expiry and removal of old paths and compatibility bridges

A useful monotonic model is `OLD_AUTHORITATIVE → TRANSITION_PREPARED → CUTOVER_COMMITTED → NEW_AUTHORITATIVE → TARGET_BECOMES_CURRENT → OLD_PATH_RETIRED`. The names are optional; at every point a caller must be able to determine which authority to follow. If atomic handoff is impossible, evaluate split-brain prevention such as fencing, epoch/version checks, monotonic switches, or leases.

Shadow reads generate verification evidence, not primary read authority. Shadow or replicated writes maintain a secondary representation, not independent mutation authority. If two paths accept different mutations independently and later synchronize them, treat that as a possible competing-authority steady-state design rather than hiding it under the word migration.

Every transitional topology needs an explicit convergence and terminal condition. If old and new paths must coexist indefinitely, redesign and document that as steady-state architecture instead of leaving a permanent "temporary" architecture.
---
