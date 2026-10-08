### 9.1 Design the domain, not the diagram

Do not add structure merely because it looks architectural. Interfaces with no abstraction behind them, forwarding-only layers, factories with no construction policy, catch-all managers, wrappers that only add indirection, generic frameworks for one concrete case, configuration for requirements that do not exist, and abstractions justified only by hypothetical future reuse are warning signs.

Before adding or preserving an abstraction, identify at least one concrete job it performs:

- express a real domain concept
- enforce an invariant or ownership boundary
- isolate genuine variation or an external dependency
- remove duplicated policy or material complexity
- create a contract callers actually need

If none applies, the abstraction has no demonstrated role. If removing it preserves correctness, required boundaries, and maintainability while making the behavior easier to understand, remove it.

Similarity alone is not a reason to unify code. Repeated behavior governed by the same real rule may indicate a missing concept; repeated shape alone does not.

Named patterns — MVVM, MVC, Repository, Adapter, Strategy, Observer, Command, dependency injection, event-driven architecture, and similar — are tools, not objectives. Before choosing one, state the concrete problem it solves here and what complexity it removes or prevents. Pattern familiarity or purity is not evidence that the pattern belongs.

---
