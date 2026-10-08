### 17.4 Reversing a behavior change

Before changing behavior in a running or deployed system, determine whether reverting code would actually undo the change's effects. Persistent data, already-sent messages, migrated state, caches, client-side persisted state, queued work, and external side effects can outlive the code that produced them.

Where a plain code revert is insufficient, identify the additional reversal, compensation, migration, invalidation, or operational step required before treating the change as safely reversible. Do not call a change "easy to roll back" when only the source code is reversible.

---
