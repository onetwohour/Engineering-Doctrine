### 16.4 Static analysis and warnings

Configured compiler diagnostics, formatters, linters, type checkers, static analyzers, security analyzers, and sanitizer or fuzzing jobs are part of the verification system when relevant to the change. Run the applicable project-defined checks; do not knowingly introduce new warnings or analysis findings.

Do not silence a valid finding merely to make the run green. If a tool finding is demonstrably inapplicable or a suppression is required by an external defect, keep the suppression as narrow as possible, preserve the safety invariant by other means where necessary, and record the concrete reason at the location where the next maintainer could otherwise remove or widen it incorrectly; never use the suppression to hide a valid failure.

Use multiple complementary techniques where the language and risk justify them; no single linter, static analyzer, test suite, sanitizer, or security scanner proves absence of defects.

---
