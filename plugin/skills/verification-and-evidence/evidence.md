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
