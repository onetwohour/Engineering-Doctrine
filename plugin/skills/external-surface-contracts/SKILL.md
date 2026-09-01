---
name: external-surface-contracts
description: Protects external, trust, data, deployment, and dependency boundaries by making contracts explicit and preserving security, user data, reversibility, and supply-chain integrity. Applies to external I/O and data-contract boundaries; security-sensitive trust and execution boundaries; user-owned, personal, sensitive, durable, persisted, transmitted, logged, cached, and permissioned data; deployed changes with persistent or external side effects; or dependencies, manifests, lockfiles, generated state, vendoring, upgrades, and migrations.
user-invocable: false
---

## Responsibility

Protects external, trust, data, deployment, and dependency boundaries by making contracts explicit and preserving security, user data, reversibility, and supply-chain integrity.

Discovery cues are shorthand only. Classify the current work against each canonical trigger and read every matching reference before covered work; a cue never narrows its trigger.

## Supporting references

- [boundaries.md](${CLAUDE_SKILL_DIR}/boundaries.md) — **external I/O and data-contract boundaries.** Canonical trigger: external input/output, files, network, config, subprocesses, serialized data, IPC, APIs, or model output crosses a boundary.
- [security.md](${CLAUDE_SKILL_DIR}/security.md) — **security-sensitive trust and execution boundaries.** Canonical trigger: authentication, authorization, permissions, secrets, cryptography, untrusted files or paths, uploads, subprocess execution, network requests, databases, serialization or deserialization, templating, plugins or extensions, or privileged operations are touched.
- [user-data.md](${CLAUDE_SKILL_DIR}/user-data.md) — **user-owned, personal, sensitive, durable, persisted, transmitted, logged, cached, and permissioned data.** Canonical trigger: user-owned, personal, sensitive, durable, uploaded, persisted, remotely stored, exported, retained, deleted, transmitted, logged, cached, or permissioned data is touched.
- [reversal.md](${CLAUDE_SKILL_DIR}/reversal.md) — **deployed changes with persistent or external side effects.** Canonical trigger: changing behavior in a running or deployed system can produce persistent data, messages, external side effects, caches, client state, or other effects that a code revert alone may not undo.
- [dependencies.md](${CLAUDE_SKILL_DIR}/dependencies.md) — **dependencies, manifests, lockfiles, generated state, vendoring, upgrades, and migrations.** Canonical trigger: dependencies, manifests, lockfiles, generated or vendored state, upgrades, removals, or migrations are touched.
