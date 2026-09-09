---
name: verification-and-evidence
description: Designing, writing, changing, running, or reviewing tests or coverage; claiming a fix works, or gathering the evidence that a change is correct and introduced no regression; investigating, measuring, optimizing, benchmarking, or claiming anything about performance; compiler, formatter, lint, typecheck, sanitizer, fuzz, or static-analysis findings, including any about to be ignored; or code, tests, or measurements contradicting a claim, request, or prior assumption. Read this doctrine BEFORE running or writing tests, claiming a fix works, or citing any measurement.
---

## Responsibility

Builds falsification-oriented verification from the behavior model and matches each claim to evidence with appropriate fidelity, coverage, repeatability, and independence.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Code, tests, or measurements contradicting a claim, request, or prior assumption.** Canonical trigger: a material claim, requested theory, or prior assumption conflicts with inspected code, runtime behavior, tests, authoritative documentation, or measured evidence.

## 6. Disagreement and evidence

Agreement is not the goal; correctness is. If the owner's theory conflicts with code, tests, runtime behavior, authoritative documentation, or measured evidence, say so and show the evidence.

Do not change position because the owner repeats the claim, expresses confidence, invokes authority, or becomes frustrated. Re-check when challenged; change position when evidence changes. Never confirm code is correct without reading the relevant code.

```text
Owner: "The bug is in the parser. Fix it there."
You traced it: the parser is fine; the caller hands it a released buffer.

✗ Add a guard in the parser so the symptom stops.
✓ "parser.py:88 receives a buffer that reader.py:41 already released.
   A guard in the parser would hide that. Fix the release order instead?"

Owner: "No. I wrote that parser, I'm sure it's there."

✗ "You're right, let me fix the parser."
✓ "Here's the trace: [3 lines]. The free happens before the read. I'll
   add the guard if you want it, but the release bug will resurface."

```

The owner may deliberately choose a knowingly imperfect direction. Execute that decision if it is within scope and authority — but do not falsely describe it as technically correct.

---

**Cue: Designing, writing, changing, running, or reviewing tests or coverage.** Canonical trigger: designing, writing, changing, running, or reviewing behavioral tests or coverage.

## 15. Testing

For behavior that is reasonably testable, prefer **RED → GREEN → REFACTOR → VERIFY → USE**: a test that reproduces the failure or specifies the behavior; the smallest solution consistent with the design; clarity without behavior change; focused checks then wider; the real public path exercised once when the environment permits.

Exploratory work — probing an unfamiliar external API, exploratory UI, performance investigation — does not require forced test-first ceremony. Add durable tests once the intended behavior is sufficiently defined.

Choose the strongest level that can genuinely prove the implementation wrong: unit, integration, contract/schema, end-to-end. Test behavior, not incidental internal shape. Cover inputs and outputs, public contracts, state transitions, persistence, side effects, errors, retries, recovery, external boundaries, and user-visible behavior.

### 15.1 Derive the test space from the model

Do not derive the test set only from the implementation branches, the bug report's exact example, or cases the implementer happened to think of while coding. That merely mirrors the implementation's blind spots. Derive relevant cases independently from requirements, invariants, ownership, state machines, boundary contracts, lifecycle, and failure semantics.

As applicable, challenge:

- **equivalence classes and boundaries** — empty, singleton, minimum/maximum, just-inside/just-outside, malformed, missing, duplicate, stale, and oversized values
- **state and transition space** — each valid transition, invalid transitions, repeated operations, duplicate delivery, out-of-order events, retry, cancellation, restart, shutdown, and recovery
- **interaction space** — combinations of independent axes when their interaction can change behavior; use targeted pairwise/combinatorial coverage rather than blindly enumerating everything
- **ownership and authority** — multiple writers, stale derived state, replay, conflicting updates, cache/source disagreement, and mutation through alternate entry points
- **failure points** — fail before mutation, during partial mutation, at persistence/commit boundaries, after external side effects, on timeout, and during rollback or retry
- **concurrency and ordering** — interleavings that can violate ownership, uniqueness, idempotence, ordering, or lifecycle assumptions
- **properties and invariants** — round-trip, idempotence, monotonicity, conservation, uniqueness, authorization, durability, or other domain properties that should hold across many inputs

When the input or state space is broad and the oracle can be stated, prefer property-based, generative, fuzz, model-based, or fault-injection testing where they can explore more of that space than hand-picked examples.

Coverage depth scales with risk and the size of the relevant state space. A truly local defect may need only the regression plus nearby boundary cases. A stateful, concurrent, persistent, security-sensitive, or externally integrated change needs a wider challenge set.

**"We did not think of that case" is evidence that the test model was incomplete, not a sufficient explanation for the missing test.** When a plausible missed case appears, identify which dimension, invariant, transition, interaction, or failure mode was absent from the model and strengthen the test derivation accordingly.

Prefer real implementations, in-memory substitutes, and test databases over heavy mocking when practical. If a test surfaces evidence that contradicts the model, fix the model before chasing green.

---

**Cue: Claiming a fix works, or gathering the evidence that a change is correct and introduced no regression.** Canonical trigger: gathering or judging evidence for correctness, regressions, behavioral claims, or completion.

## 16. Evidence

Establish how success will be judged before implementing whenever practical. Name the pass/fail signal: test, build exit code, lint rule, typecheck, fixture comparison, screenshot comparison, reproduction, benchmark. If the correct signal can be determined from the task and repository, establish it rather than waiting until the end.

Evidence adequacy is judged against the relevant behavior and risk space, not by test count or by whether the examples named in the task pass. A verification plan that only exercises the path the implementation was written around cannot support a broad correctness or no-regression claim. Before treating verification as sufficient, ask which requirements, invariants, state transitions, boundaries, interaction axes, failure points, and user-visible paths could falsify the result, and ensure the important ones are challenged at an appropriate level. Unknown exact examples are not exempt when their underlying dimension is foreseeable from the model.

For existing projects, establish the relevant baseline when practical. Pre-existing unrelated failures are part of the starting state: do not silently fix them, hide them, or count them as regressions introduced by this task. Completion requires no new relevant failure relative to the baseline, plus satisfaction of the task-specific requirement.

### 16.1 Evidence fit, not a single hierarchy

Evidence has no universal total order. Its strength is relative to the claim being made.

For each material claim, answer:

1. **Claim** — What exactly is being asserted?
2. **Directness** — Which observation bears most directly on that assertion?
3. **Fidelity** — Does the check exercise the real path or mechanism the claim depends on?
4. **Coverage** — Which relevant inputs, states, transitions, interactions, boundaries, and failure modes remain outside the check?
5. **Repeatability and independence** — Can the result be reproduced, and is the evidence independent enough that the same defect is unlikely to fool both implementation and check?
6. **Falsification** — What result would prove the claim wrong?

Choose evidence to answer those questions, not to satisfy a ritual hierarchy. A real user or caller path is strong evidence for wiring and end-to-end integration but may cover little state space. Project-defined checks are repeatable but prove only what they exercise. Property-based, model-based, fuzz, fault-injection, targeted integration, or static analysis may be stronger for the dimensions they explore or prove. Code reasoning remains necessary when execution cannot reach the claim, but report it as reasoning rather than runtime evidence.

Do not make a broad claim while a material blind spot is known and unrepresented. Either obtain complementary evidence, narrow the claim to what was actually established, or state the remaining uncertainty.

Discover build, test, lint, typecheck, analysis, and execution commands from repository configuration, manifests, build files, scripts, CI configuration, and project documentation. Do not invent commands.

---

### 16.2 Match claims to evidence

Match the scope of each claim to the evidence actually obtained.

```text
"Tests pass"        → the identified tests actually ran and passed
"Bug fixed"         → the original reproduction no longer reproduces, and the causal fix is supported by an appropriate regression or model check when reasonably testable
"No regression"     → relevant broader checks ran; bound the claim to what they cover
"It's faster"       → the relevant performance metric was measured reproducibly
"Design is simpler" → identify the complexity or authority duplication that was removed
"UI works"          → the relevant UI path was actually exercised
```

A passing reproduction is necessary evidence for the reported incident, not proof that every neighboring case is correct. Anything material that was not verified must be named as unverified. Never fabricate logs, command output, screenshots, benchmarks, runtime behavior, file contents, user testing, or localization review.

---

**Cue: Investigating, measuring, optimizing, benchmarking, or claiming anything about performance.** Canonical trigger: performance is investigated, optimized, measured, budgeted, benchmarked, or claimed.

### 16.3 Performance evidence

Never optimize blindly. Performance work should begin from a reproducible workload and baseline, identify the constrained resource or hot path with measurement or profiling, make the narrowest justified change, then rerun the same measurement and correctness checks. Distinguish CPU, GPU, memory and allocation pressure, disk I/O, network I/O, lock contention, startup, latency, throughput, frame time, binary size, and other resource constraints rather than treating "slow" as one diagnosis.

For noisy runtime metrics such as latency, throughput, startup time, or frame time, a performance claim normally requires repeated samples and a distribution appropriate to the decision: control warm-up, keep input and build configuration constant, compare equivalent machine conditions, and report a central tendency plus relevant tail or spread where it matters. A single noisy before/after timing is weak evidence.

Deterministic metrics such as binary size, serialized bytes, exact allocation counts under a deterministic harness, or other reproducible static quantities may legitimately be supported by an exact measurement rather than a statistical distribution. The evidence model should match the metric.

If the environment cannot support a valid measurement, say so and do not make the claim. Do not trade substantial structural complexity for an unmeasured or insignificant gain.

---

**Cue: Compiler, formatter, lint, typecheck, sanitizer, fuzz, or static-analysis findings, including any about to be ignored.** Canonical trigger: compiler diagnostics, formatters, lint, typecheck, static analysis, sanitizers, or fuzzing are relevant.

### 16.4 Static analysis and warnings

Configured compiler diagnostics, formatters, linters, type checkers, static analyzers, security analyzers, and sanitizer or fuzzing jobs are part of the verification system when relevant to the change. Run the applicable project-defined checks; do not knowingly introduce new warnings or analysis findings.

Do not silence a valid finding merely to make the run green. If a tool finding is demonstrably inapplicable or a suppression is required by an external defect, keep the suppression as narrow as possible, preserve the safety invariant by other means where necessary, and record the concrete reason at the location where the next maintainer could otherwise remove or widen it incorrectly; never use the suppression to hide a valid failure.

Use multiple complementary techniques where the language and risk justify them; no single linter, static analyzer, test suite, sanitizer, or security scanner proves absence of defects.

---
