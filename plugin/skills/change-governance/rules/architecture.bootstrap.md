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
