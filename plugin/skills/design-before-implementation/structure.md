### 9.6 Cohesion, coupling, and component size

Prefer high cohesion and low coupling. A component should own a coherent responsibility and have an understandable reason to change. A change to one feature should disturb as little unrelated code as the design reasonably permits.

Proximity is not ownership. Do not keep appending new behavior to an existing file, class, module, function, service, controller, view model, or state container merely because related behavior already lives there. Before extending a component, decide whether the new behavior shares the same responsibility, invariants, lifecycle, dependencies, and reason to change. Growth in size or branching is a signal to reassess that boundary. If the addition would introduce a distinct responsibility or make the component materially harder to understand, navigate, test, or modify in isolation, refactor instead of hanging more code off the existing implementation: extract or introduce the smallest cohesive function, type or class, module or file, service, or other unit that gives the responsibility an explicit owner and a narrow contract. Keep behavior together when it truly shares ownership; separate it when it does not.

File length, line count, dependency count, and public-method count are signals, not thresholds. Consider decomposing a file, class, module, function, service, controller, view model, or state container when it owns unrelated responsibilities, spans architectural layers, coordinates too many subsystems, has several independent reasons to change, exposes an excessively broad surface, accumulates many dependencies, is difficult to test in isolation, or routinely requires understanding unrelated regions before a safe modification can be made.

Split by responsibility, ownership, lifecycle, or policy boundary — not arbitrarily by line count. Do not replace one God component with a graph of tiny wrappers, pass-through layers, single-use interfaces, and indirection that makes one behavior require opening many files. The unit of decomposition is a coherent concept, not the smallest possible file.

### 9.7 Dependency direction and domain independence

Dependencies should follow deliberate ownership rather than convenience. Avoid circular dependencies, hidden bidirectional coordination, cross-layer mutation, and shared mutable state whose owner is unclear.

Core domain concepts should not depend unnecessarily on UI frameworks, storage engines, operating-system APIs, networking clients, serialization libraries, database drivers, or third-party SDKs. When an external technology represents an implementation detail rather than the domain itself, keep it behind the narrowest useful boundary so replacing it does not require rewriting unrelated policy.

Do not let third-party types silently become the application's domain model merely because the library is convenient. Translate at boundaries when doing so preserves ownership, invariants, and replacement freedom. Do not add adapter ceremony where the dependency is itself the stable domain contract and isolation would add more complexity than it removes.

### 9.8 Narrow contracts

Expose only what callers need. Prefer small cohesive interfaces, domain-specific inputs and outputs, explicit side effects, and contracts that reveal required semantics without exposing internal representation.

Do not return or accept whole internal state objects merely for convenience. Do not make unrelated callers depend on implementation details. Internal refactoring of one component should not force broad changes elsewhere unless the public concept itself changed.
