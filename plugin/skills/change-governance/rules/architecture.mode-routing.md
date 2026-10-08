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
