### 9.7 Dependency direction and domain independence

Dependencies should follow deliberate ownership rather than convenience. Avoid circular dependencies, hidden bidirectional coordination, cross-layer mutation, and shared mutable state whose owner is unclear.

Core domain concepts should not depend unnecessarily on UI frameworks, storage engines, operating-system APIs, networking clients, serialization libraries, database drivers, or third-party SDKs. When an external technology represents an implementation detail rather than the domain itself, keep it behind the narrowest useful boundary so replacing it does not require rewriting unrelated policy.

Do not let third-party types silently become the application's domain model merely because the library is convenient. Translate at boundaries when doing so preserves ownership, invariants, and replacement freedom. Do not add adapter ceremony where the dependency is itself the stable domain contract and isolation would add more complexity than it removes.
