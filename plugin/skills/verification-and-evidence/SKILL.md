---
name: verification-and-evidence
description: Designing, writing, changing, running, or reviewing tests or coverage; claiming a fix works, or gathering the evidence that a change is correct and introduced no regression; investigating, measuring, optimizing, benchmarking, or claiming anything about performance; compiler, formatter, lint, typecheck, sanitizer, fuzz, or static-analysis findings, including any about to be ignored; or code, tests, or measurements contradicting a claim, request, or prior assumption. Read this doctrine BEFORE testing, measuring, or making a verification claim.
---

## Responsibility

Builds falsification-oriented verification from the behavior model and matches each claim to evidence with appropriate fidelity, coverage, repeatability, and independence.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Code, tests, or measurements contradicting a claim, request, or prior assumption

Canonical trigger: a material claim, requested theory, or prior assumption conflicts with inspected code, runtime behavior, tests, authoritative documentation, or measured evidence.

- [evidence.disagreement](rules/evidence.disagreement.md) — Disagreement and evidence
### Cue: Designing, writing, changing, running, or reviewing tests or coverage

Canonical trigger: designing, writing, changing, running, or reviewing behavioral tests or coverage.

- [testing.core](rules/testing.core.md) — Testing
- [testing.model-derived-space](rules/testing.model-derived-space.md) — Derive the test space from the model
### Cue: Claiming a fix works, or gathering the evidence that a change is correct and introduced no regression

Canonical trigger: gathering or judging evidence for correctness, regressions, behavioral claims, or completion.

- [evidence.core](rules/evidence.core.md) — Evidence
- [evidence.hierarchy](rules/evidence.hierarchy.md) — Evidence fit, not a single hierarchy
- [evidence.claim-matching](rules/evidence.claim-matching.md) — Match claims to evidence
### Cue: Investigating, measuring, optimizing, benchmarking, or claiming anything about performance

Canonical trigger: performance is investigated, optimized, measured, budgeted, benchmarked, or claimed.

- [evidence.performance](rules/evidence.performance.md) — Performance evidence
### Cue: Compiler, formatter, lint, typecheck, sanitizer, fuzz, or static-analysis findings, including any about to be ignored

Canonical trigger: compiler diagnostics, formatters, lint, typecheck, static analysis, sanitizers, or fuzzing are relevant.

- [evidence.static-analysis](rules/evidence.static-analysis.md) — Static analysis and warnings
