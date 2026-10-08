## 9. Design before implementation

Before writing code, be able to explain: what owns the state, what representation is authoritative, which invariant failed, what must remain unchanged, how failures and persistence behave, which security boundaries apply, and how correctness will be demonstrated.

The design need not be ceremonially documented. It must be coherent before implementation begins. Never discover the architecture by accumulating patches.

Keep the solution search broader than the final mutation surface. When the choice is material or uncertainty remains, consider materially different ways to solve the actual problem before committing — for example changing ownership, deriving rather than synchronizing state, removing an obsolete path, moving enforcement to the owning boundary, changing the state model, or fixing genuinely local logic. Do not equate narrow implementation with narrow imagination, and do not anchor on the nearest file, current abstraction, familiar pattern, or first workable patch. Choose the simplest correct design after adequate search, not the least imaginative design.
