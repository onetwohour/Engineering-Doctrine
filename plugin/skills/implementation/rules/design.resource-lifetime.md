### 13.1 Bind every resource to an owner and a release

Every acquired resource needs an owner and a release bound to that owner's lifetime: memory, file descriptors and handles, sockets, locks, transactions, subprocesses, temporary files, timers, watchers, subscriptions, pooled connections, and device contexts.

Prefer the construct the language already provides for scope-bound release — destructors, `defer`, `using`, `with`, try-with-resources, context managers, structured concurrency scopes — over paired acquire and release calls that a maintainer has to keep matched by hand.

Release must hold on every exit path, not only the successful one: early return, exception, cancellation, timeout, retry, and shutdown. A release that runs only when a later line is reached is already a leak, and so is one a caller has to remember to invoke when nothing in the type says so.

Ownership is singular and transferable, not ambient. Two owners each releasing is a double free; two owners each assuming the other releases is a leak. When a resource genuinely outlives its creator, name the owner it passes to rather than leaving the transfer implicit.

---
