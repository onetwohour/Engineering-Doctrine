### 9.9 Deletion and refactoring

Prefer removing obsolete complexity to layering new complexity on top of it when the requested work makes that removal necessary. If an in-scope change makes code unreachable, a compatibility shim obsolete, an abstraction redundant, or one of several implementations non-authoritative, remove the obsolete path when doing so is safe and within authority. Version control is the archive; commented-out implementations and dead branches are not.

Refactoring is successful when it reduces concepts, code paths, duplicated policy, hidden coupling, unnecessary state, or accidental indirection while preserving required behavior. Fewer lines are not automatically better, and more abstractions are not automatically cleaner.

This is not permission for opportunistic cleanup. Nearby debt unrelated to the requested outcome remains out of scope under `scope.honesty`; report material debt rather than silently expanding the task. Broad cleanup or architectural renovation belongs in an explicit refactoring task with its own scope and verification.
