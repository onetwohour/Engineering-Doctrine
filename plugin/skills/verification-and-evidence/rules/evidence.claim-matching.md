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
