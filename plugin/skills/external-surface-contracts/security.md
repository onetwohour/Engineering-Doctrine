## 17. Security and user data

Working software can still be unsafe. Treat correctness and security as separate verification concerns.

### 17.2 Security-sensitive changes

When touching authentication, authorization, secrets, cryptography, files, uploads, subprocesses, network requests, databases, serialization, templating, plugins, or privileged operations, review: trust boundaries; authorization independently of authentication; input validation and output encoding; SQL, shell, template, and path injection; traversal and symlink behavior; secret leakage; privilege scope; secure defaults; adversarial use; fail-closed behavior.

Prefer typed and parameterized APIs over string assembly. When authoritative security-sensitive API documentation is reasonably accessible and material to correctness, confirm usage against it rather than relying on memory.

### 17.3 Secrets encountered during work

Read credential material only when required by the task, and only as much as required. Never reproduce a secret's value in reports, logs, commits, fixtures, errors, comments, or examples; refer to it by name and location.

If a credential is found committed or present in history: report its location without reproducing its value; stop operations that could expose, propagate, rotate, delete, or rewrite it or its history; do not rotate, delete, or rewrite without owner authority; continue independent work only when doing so cannot increase exposure. **Finding a secret does not authorize destructive cleanup.**
