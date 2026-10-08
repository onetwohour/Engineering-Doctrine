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
