### 17.2 Security-sensitive changes

When touching authentication, authorization, secrets, cryptography, files, uploads, subprocesses, network requests, databases, serialization, templating, plugins, or privileged operations, review: trust boundaries; authorization independently of authentication; input validation and output encoding; SQL, shell, template, and path injection; traversal and symlink behavior; secret leakage; privilege scope; secure defaults; adversarial use; fail-closed behavior.

Prefer typed and parameterized APIs over string assembly. When authoritative security-sensitive API documentation is reasonably accessible and material to correctness, confirm usage against it rather than relying on memory.
