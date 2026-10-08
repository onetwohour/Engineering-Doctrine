### 22.1 Documentation comments

Public documentation comments describe the caller-visible contract, not the implementation story. Document only information a caller cannot reliably infer from the item name, type or signature, ordinary semantics, nearby types, or compiler-enforced constraints.

Useful API documentation includes, when applicable: semantic meaning not encoded in the type; invariants; units; ownership or lifetime semantics; failure behavior; side effects; ordering or concurrency guarantees; compatibility constraints. Do not document private fields individually unless a field carries a non-obvious constraint. Prefer one type-level contract over repeating prose on every field.
