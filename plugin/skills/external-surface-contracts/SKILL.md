---
name: external-surface-contracts
description: "Reading or writing external data: files, network, config, subprocess output, IPC, serialized formats, model output; auth, permissions, secrets, crypto, untrusted paths, uploads, subprocess execution, or privileged operations; user-owned, personal, or sensitive data that is stored, transmitted, logged, cached, exported, retained, or deleted; changing a running or deployed system where a code revert alone would not undo the effects; or adding, upgrading, or removing a dependency, or touching a manifest, lockfile, vendored or generated state. Read this doctrine BEFORE touching external data, auth, secrets, user data, dependencies, or a live system."
user-invocable: false
---

## Responsibility

Protects external, trust, data, deployment, and dependency boundaries by making contracts explicit and preserving security, user data, reversibility, and supply-chain integrity.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Reading or writing external data: files, network, config, subprocess output, IPC, serialized formats, model output.** Canonical trigger: external input/output, files, network, config, subprocesses, serialized data, IPC, APIs, or model output crosses a boundary.

## 14. Boundary contracts

Determine the real contract of external data before using it: user input, files, databases, network responses, third-party APIs, IPC, serialized formats, configuration, environment variables, subprocess output, plugins, model output.

At the boundary: parse explicitly, validate required fields, constrain ranges, distinguish missing from invalid, reject impossible states, prefer typed or generated clients where appropriate, parameterize database and command interfaces.

```text
✗ every caller improvises:   name = response?.user?.name ?? "unknown"
✓ the boundary owns it:      user = UserSchema.parse(response.user)

```

Scattered optional chaining, blanket exception handling, and default-empty fallbacks are not substitutes for understanding the contract. Validate once at the correct boundary where practical.

---

**Cue: Auth, permissions, secrets, crypto, untrusted paths, uploads, subprocess execution, or privileged operations.** Canonical trigger: authentication, authorization, permissions, secrets, cryptography, untrusted files or paths, uploads, subprocess execution, network requests, databases, serialization or deserialization, templating, plugins or extensions, or privileged operations are touched.

## 17. Security and user data

Working software can still be unsafe. Treat correctness and security as separate verification concerns.

**Cue: User-owned, personal, or sensitive data that is stored, transmitted, logged, cached, exported, retained, or deleted.** Canonical trigger: user-owned, personal, sensitive, durable, uploaded, persisted, remotely stored, exported, retained, deleted, transmitted, logged, cached, or permissioned data is touched.

### 17.1 User data

Protect user data as both a correctness and privacy concern. Never silently lose user work, and do not collect, read, retain, copy, transmit, log, cache, or expose more user or sensitive data than the required behavior needs.

For migrations and persistent-state changes: define rollback or recovery behavior first, preserve previously valid state on partial failure, prefer atomic transitions where needed, define compatibility with prior formats, and state explicitly when no rollback exists. Avoid designs in which one failed operation leaves several representations inconsistent.

Preserve the product's intended retention, deletion, export, access, and permission semantics. Do not move sensitive data into a less protected surface merely because it is convenient for implementation, diagnostics, testing, or caching. Prefer least-privilege access and the narrowest data projection that serves the operation.

Do not invent legal, policy, retention, or consent requirements. When those decisions are not already specified and materially affect the implementation, obtain the appropriate owner decision rather than silently choosing policy.

A design that makes user data easier to lose, leak, over-retain, or access unnecessarily is defective.

---

**Cue: Auth, permissions, secrets, crypto, untrusted paths, uploads, subprocess execution, or privileged operations.** Canonical trigger: authentication, authorization, permissions, secrets, cryptography, untrusted files or paths, uploads, subprocess execution, network requests, databases, serialization or deserialization, templating, plugins or extensions, or privileged operations are touched.

### 17.2 Security-sensitive changes

When touching authentication, authorization, secrets, cryptography, files, uploads, subprocesses, network requests, databases, serialization, templating, plugins, or privileged operations, review: trust boundaries; authorization independently of authentication; input validation and output encoding; SQL, shell, template, and path injection; traversal and symlink behavior; secret leakage; privilege scope; secure defaults; adversarial use; fail-closed behavior.

Prefer typed and parameterized APIs over string assembly. When authoritative security-sensitive API documentation is reasonably accessible and material to correctness, confirm usage against it rather than relying on memory.

### 17.3 Secrets encountered during work

Read credential material only when required by the task, and only as much as required. Never reproduce a secret's value in reports, logs, commits, fixtures, errors, comments, or examples; refer to it by name and location.

If a credential is found committed or present in history: report its location without reproducing its value; stop operations that could expose, propagate, rotate, delete, or rewrite it or its history; do not rotate, delete, or rewrite without owner authority; continue independent work only when doing so cannot increase exposure. **Finding a secret does not authorize destructive cleanup.**

**Cue: Changing a running or deployed system where a code revert alone would not undo the effects.** Canonical trigger: changing behavior in a running or deployed system can produce persistent data, messages, external side effects, caches, client state, or other effects that a code revert alone may not undo.

### 17.4 Reversing a behavior change

Before changing behavior in a running or deployed system, determine whether reverting code would actually undo the change's effects. Persistent data, already-sent messages, migrated state, caches, client-side persisted state, queued work, and external side effects can outlive the code that produced them.

Where a plain code revert is insufficient, identify the additional reversal, compensation, migration, invalidation, or operational step required before treating the change as safely reversible. Do not call a change "easy to roll back" when only the source code is reversible.

---

**Cue: Adding, upgrading, or removing a dependency, or touching a manifest, lockfile, vendored or generated state.** Canonical trigger: dependencies, manifests, lockfiles, generated or vendored state, upgrades, removals, or migrations are touched.

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
