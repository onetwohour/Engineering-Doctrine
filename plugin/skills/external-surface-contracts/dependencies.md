## 18. Dependencies and generated state

A dependency is part of both the attack surface and the maintenance burden. A plausible-sounding package name is itself an attack surface: adversaries register names that models commonly invent.

Prefer what the project already uses. Before proposing a new dependency, confirm that it actually exists, the correct package and namespace, maintainer or publisher legitimacy, maintenance status, and adoption history.

For a dependency that would become a meaningful part of the product, also evaluate as applicable: license compatibility; API stability; security and vulnerability history; transitive dependency cost; runtime, binary, and build footprint; supported platforms; ecosystem maturity; release cadence; and replacement difficulty. Prefer mature existing implementations for complex, standardized, security-sensitive, or interoperability-heavy functionality when they reduce total risk; do not add a package for trivial behavior that is clearer and safer to own locally.

When practical, keep third-party dependencies behind narrow project-owned boundaries so the dependency does not spread its types, lifecycle assumptions, or error model through unrelated code. Do not add a wrapper that merely renames every method; isolation earns its place only when it protects a real project contract or reduces replacement and testing cost.

Never install a new dependency without owner agreement (`judgment.decision-gate`). **Never respond to an installation failure by guessing a similar-looking package name.**

### 18.1 Generated, locked, and vendored content

Generated outputs are not hand-edited source: change their authoritative input, then regenerate. This includes generated clients, compiled schemas, generated bindings, vendored output, and lockfiles.

A lockfile is generated resolution state that many repositories intentionally track as part of the reproducible dependency contract. If the repository tracks it: regenerate when an in-scope manifest or dependency change requires it, include the resulting change per repository policy, never regenerate as an unrelated side effect, never hand-edit. "Generated" does not mean "never committed" — repository policy and the artifact's actual role decide.

---
