---
name: external-surface-contracts
description: "Reading or writing external data: files, network, config, subprocess output, IPC, serialized formats, model output; auth, permissions, secrets, crypto, untrusted paths, uploads, subprocess execution, or privileged operations; user-owned, personal, or sensitive data that is stored, transmitted, logged, cached, exported, retained, or deleted; changing a running or deployed system where a code revert alone would not undo the effects; or adding, upgrading, or removing a dependency, or touching a manifest, lockfile, vendored or generated state. Read this doctrine BEFORE touching external, security, dependency, user-data, or live-system boundaries."
---

## Responsibility

Protects external, trust, data, deployment, and dependency boundaries by making contracts explicit and preserving security, user data, reversibility, and supply-chain integrity.

**Loading contract:** This file is a discovery index, not a reduced version of the rules.
For every applicable cue below, read every listed file from `rules/` using this skill's
installed base directory before acting or asserting compliance. Each file contains
the complete authoritative rule body compiled from ENGINEERING_DOCTRINE.md.
Do not infer requirements from these titles alone. Do not load irrelevant cues.
When the necessary files are inaccessible, report the limitation instead of
claiming to have applied an unread rule. Always-tier doctrine is separately injected.

### Cue: Reading or writing external data: files, network, config, subprocess output, IPC, serialized formats, model output

Canonical trigger: external input/output, files, network, config, subprocesses, serialized data, IPC, APIs, or model output crosses a boundary.

- [boundary.contracts](rules/boundary.contracts.md) — Boundary contracts
### Cue: Auth, permissions, secrets, crypto, untrusted paths, uploads, subprocess execution, or privileged operations

Canonical trigger: authentication, authorization, permissions, secrets, cryptography, untrusted files or paths, uploads, subprocess execution, network requests, databases, serialization or deserialization, templating, plugins or extensions, or privileged operations are touched.

- [security.core](rules/security.core.md) — Security and user data
### Cue: User-owned, personal, or sensitive data that is stored, transmitted, logged, cached, exported, retained, or deleted

Canonical trigger: user-owned, personal, sensitive, durable, uploaded, persisted, remotely stored, exported, retained, deleted, transmitted, logged, cached, or permissioned data is touched.

- [security.user-data](rules/security.user-data.md) — User data
### Cue: Auth, permissions, secrets, crypto, untrusted paths, uploads, subprocess execution, or privileged operations

Canonical trigger: authentication, authorization, permissions, secrets, cryptography, untrusted files or paths, uploads, subprocess execution, network requests, databases, serialization or deserialization, templating, plugins or extensions, or privileged operations are touched.

- [security.sensitive-changes](rules/security.sensitive-changes.md) — Security-sensitive changes
- [security.secrets](rules/security.secrets.md) — Secrets encountered during work
### Cue: Changing a running or deployed system where a code revert alone would not undo the effects

Canonical trigger: changing behavior in a running or deployed system can produce persistent data, messages, external side effects, caches, client state, or other effects that a code revert alone may not undo.

- [security.reversal](rules/security.reversal.md) — Reversing a behavior change
### Cue: Adding, upgrading, or removing a dependency, or touching a manifest, lockfile, vendored or generated state

Canonical trigger: dependencies, manifests, lockfiles, generated or vendored state, upgrades, removals, or migrations are touched.

- [dependencies.core](rules/dependencies.core.md) — Dependencies and generated state
- [dependencies.generated-state](rules/dependencies.generated-state.md) — Generated, locked, and vendored content
