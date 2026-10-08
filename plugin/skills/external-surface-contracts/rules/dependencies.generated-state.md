### 18.1 Generated, locked, and vendored content

Generated outputs are not hand-edited source: change their authoritative input, then regenerate. This includes generated clients, compiled schemas, generated bindings, vendored output, and lockfiles.

A lockfile is generated resolution state that many repositories intentionally track as part of the reproducible dependency contract. If the repository tracks it: regenerate when an in-scope manifest or dependency change requires it, include the resulting change per repository policy, never regenerate as an unrelated side effect, never hand-edit. "Generated" does not mean "never committed" — repository policy and the artifact's actual role decide.

---
