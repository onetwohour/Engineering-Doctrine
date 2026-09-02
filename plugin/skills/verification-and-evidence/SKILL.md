---
name: verification-and-evidence
description: Invoke this Doctrine skill when current work involves designing, writing, changing, running, or reviewing tests and coverage; gathering or judging evidence that the change is correct and introduced no regression; investigating, measuring, optimizing, benchmarking, or claiming anything about performance; compiler, formatter, lint, typecheck, sanitizer, fuzz, or static-analysis findings; or what the code, tests, or measurements show contradicts a claim, request, or prior assumption.
user-invocable: false
---

## Responsibility

Builds falsification-oriented verification from the behavior model and matches each claim to evidence with appropriate fidelity, coverage, repeatability, and independence.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [testing.md](${CLAUDE_SKILL_DIR}/testing.md) — **designing, writing, changing, running, or reviewing tests and coverage.** Canonical trigger: designing, writing, changing, running, or reviewing behavioral tests or coverage.
- [evidence.md](${CLAUDE_SKILL_DIR}/evidence.md) — **gathering or judging evidence that the change is correct and introduced no regression.** Canonical trigger: gathering or judging evidence for correctness, regressions, behavioral claims, or completion.
- [performance.md](${CLAUDE_SKILL_DIR}/performance.md) — **investigating, measuring, optimizing, benchmarking, or claiming anything about performance.** Canonical trigger: performance is investigated, optimized, measured, budgeted, benchmarked, or claimed.
- [static-analysis.md](${CLAUDE_SKILL_DIR}/static-analysis.md) — **compiler, formatter, lint, typecheck, sanitizer, fuzz, or static-analysis findings.** Canonical trigger: compiler diagnostics, formatters, lint, typecheck, static analysis, sanitizers, or fuzzing are relevant.
- [disagreement.md](${CLAUDE_SKILL_DIR}/disagreement.md) — **what the code, tests, or measurements show contradicts a claim, request, or prior assumption.** Canonical trigger: a material claim, requested theory, or prior assumption conflicts with inspected code, runtime behavior, tests, authoritative documentation, or measured evidence.
