## 9. Design before implementation

Before writing code, be able to explain: what owns the state, what representation is authoritative, which invariant failed, what must remain unchanged, how failures and persistence behave, which security boundaries apply, and how correctness will be demonstrated.

The design need not be ceremonially documented. It must be coherent before implementation begins. Never discover the architecture by accumulating patches.

Keep the solution search broader than the final mutation surface. When the choice is material or uncertainty remains, consider materially different ways to solve the actual problem before committing — for example changing ownership, deriving rather than synchronizing state, removing an obsolete path, moving enforcement to the owning boundary, changing the state model, or fixing genuinely local logic. Do not equate narrow implementation with narrow imagination, and do not anchor on the nearest file, current abstraction, familiar pattern, or first workable patch. Choose the simplest correct design after adequate search, not the least imaginative design.

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

### 9.2 Make invalid states hard to represent

```text
✗ is_loading, is_loaded, has_error, is_empty     six of sixteen
                                                  combinations meaningless
✓ state: Loading | Loaded(items) | Failed(reason)

```

Prefer one authoritative value over synchronized copies, domain types over ambiguous primitives, explicit states over combinations of booleans, explicit transitions over implicit mutation, constrained construction over partial initialization, typed boundaries over string conventions. Use type machinery where it materially improves correctness, not as decoration.

### 9.3 Keep each rule in one place

Do not scatter business rules, authorization rules, persistence policy, compatibility behavior, or validation across many callers. Place a rule at the concept that owns it.

Prefer one coherent rule over unrelated exceptions; one source of truth over synchronized copies; explicit ownership over shared ambiguity; enforced invariants over repeated repair; clear contracts over reaching into internals.

### 9.4 Human cost is part of design

Before implementing, ask: Is there a simpler model? Is ownership obvious? Is truth singular where it should be? Is this complexity inherent to the domain, or are people paying for implementation, testing, tooling, or automation convenience? Would a user need to understand an internal concept that should remain internal? Would the next maintainer need hidden session knowledge? Is a setting, mode, workflow step, or explanation being introduced only because the implementation failed to provide the correct behavior directly?

A solution that works technically but unnecessarily makes the human task harder is not complete.

### 9.10 Make engineering artifacts native to the project

A good implementation should look as though a competent maintainer who understands this repository and domain made the choices deliberately — not like a generic reference implementation transplanted into it.

Before choosing naming, layering, abstractions, error models, configuration shape, test structure, file decomposition, or dependency patterns, learn the project's local grammar where it is sound: existing ownership boundaries, terminology, composition style, error handling, lifecycle, persistence model, testing idioms, and public conventions. Preserve meaningful local identity; do not normalize a distinct system into the generator's preferred architecture.

Local convention is evidence, not authority. Do not cargo-cult broken patterns merely to blend in. When a local pattern conflicts with ownership, invariants, safety, or the requested outcome, fix the underlying model rather than copying either the local defect or a fashionable external pattern.

Reject choices justified only by phrases such as "standard architecture," "best practice," "cleaner pattern," or "more professional" when no concrete property of this system requires them. The relevant question is not whether a pattern is common; it is what problem it solves here and what complexity it removes or prevents.

---
