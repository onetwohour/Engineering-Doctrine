---
name: design-before-implementation
description: Tracing a bug, failure, or unexpected behavior to its actual cause and entry point; working out what owns which state, with its invariants, lifecycle, boundaries, and failure semantics; choosing a domain model, ownership, contract, abstraction, or architecture before writing code; adding a branch, flag, mode, setting, exception, special case, magic value, or hardcoded path; moving code between components, changing dependency direction, or widening a contract; or refactoring, consolidating duplicated authority, or deleting an obsolete path. Read this doctrine BEFORE settling a cause, ownership, contract, flag, special case, move, or refactor.
---

## Responsibility

Establishes causal understanding, explicit ownership and invariants, and a coherent design before implementation rather than turning symptoms into architecture.

Cues are discovery shorthand; the rules below are the binding text, in doctrine order and grouped by the trigger that routes them.

**Cue: Tracing a bug, failure, or unexpected behavior to its actual cause and entry point.** Canonical trigger: establishing behavior, cause, entry point, data flow, or failure path.

## 7. Understand before changing

Begin from real behavior, not from the nearest file. Identify as applicable: the real entry point, caller intent, current behavior, expected behavior, the actual failure, what must remain unchanged, relevant state and data flow, mutation paths, lifecycle, persistence, external boundaries, failure paths, the user-visible path, and the verification signal.

Investigation breadth is governed by causal uncertainty, not by the hoped-for size of the diff. Start from the strongest available evidence, then follow callers, callees, ownership, state transitions, lifecycle, persistence, concurrency, boundaries, and relevant history as far as needed to distinguish competing explanations. Keep broad investigation question-driven rather than indiscriminate; a broad investigation may correctly end in a one-line fix.

Read relevant types, schemas, interfaces, manifests, lockfiles, configuration, CI definitions, and authoritative documentation rather than inferring them when the distinction matters.

Reproduce bugs before fixing them when reproduction is reasonably possible. Never assume the location where a symptom appears is the cause.

Read surrounding code before editing and follow the repository's current conventions unless they are unsafe, clearly defective, or contradicted by a more authoritative project convention. Existing code is evidence of convention, not proof of correctness; when several patterns coexist, determine which is canonical.

Ask: what actually happened, what should have happened, where did they diverge, which invariant failed, which component should have enforced it, why was the invalid state reachable, and what would prove the result correct.

Design hypotheses may be formed while investigation is incomplete; label them provisional and use them to identify what evidence would discriminate among alternatives. Do not commit a material design decision while a discoverable unknown could materially change that decision.

---

**Cue: Working out what owns which state, with its invariants, lifecycle, boundaries, and failure semantics.** Canonical trigger: reasoning about ownership, state, invariants, lifecycle, dependencies, boundaries, or failure semantics.

## 8. Model the system

For anything beyond a truly local defect, establish the relevant model. You should be able to explain the system, not merely list files.

**Ownership** — What owns each important piece of state? Who may mutate it, who only observes? Who owns its lifecycle? Is that ownership intentional or accidental?

**Authority** — What representation is authoritative? Is there exactly one source of truth where there should be? Can derived values replace synchronized copies? Does any component maintain state it does not own?

**Invariants** — What must always be true, and where is each rule enforced? Can callers easily construct invalid states? Does correctness depend on everyone remembering a convention?

**Lifecycle** — What states exist and which transitions are valid? What happens during initialization, loading, mutation, retry, cancellation, shutdown, persistence, and recovery?

**Dependencies** — Is direction understandable? Look for circular or hidden bidirectional dependencies, implicit ordering requirements, accidental lifecycle coupling, and shared mutable state without clear ownership.

**Boundaries** — Where does each responsibility begin and end? What crosses? Where must validation and policy be enforced?

**Failure** — If an operation fails: what state remains, what may be retried, what must roll back, what must remain durable, what may be partially complete, what must fail closed?

If the relevant model is materially fuzzy, continue investigating.

---

**Cue: Choosing a domain model, ownership, contract, abstraction, or architecture before writing code.** Canonical trigger: choosing or changing domain model, ownership, abstractions, contracts, or architecture.

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

**Cue: Adding a branch, flag, mode, setting, exception, special case, magic value, or hardcoded path.** Canonical trigger: changing branches, flags, modes, settings, exceptions, identities, magic values, or hardcoded paths.

### 9.5 Control paths and fixed values

Branches, flags, modes, settings, exceptions, fixed identities, magic values, and alternate paths are legitimate only when they represent a real semantic distinction.

Before adding or extending one, answer:

1. What durable domain or operational distinction does it represent?
2. Which concept owns that distinction?
3. What authoritative state determines the branch, value, or mode?
4. Can its purpose still be explained without referring to the bug, ticket, caller, user, document, machine, environment, or failing test that exposed the need?

If a material control path has no satisfactory answer, do not commit it as architecture yet. Investigate the owning rule instead.

Do not turn one incident into permanent structure merely because doing so is the shortest patch. Existing technical debt is evidence to investigate, not automatic precedent to extend. Persistence does not make an incident-specific exception legitimate; a branch added only because the principled path was difficult is still an unjustified branch.

Hardcoding is about authority, not syntax. Ask where the value belongs and what should determine it. Moving an unjustified value from source code to a constant, configuration file, JSON, table, registry, database, or environment variable does not repair its authority.

Fixed operational values — timeouts, retry counts, batch sizes, concurrency limits, cache sizes, thresholds — need a source: an external contract, established project policy, measured requirement, resource budget, or algorithmic constraint. Trial-and-error until the current example passes is not a source.

Do not over-apply this rule. A legitimate local branch remains legitimate; a genuine domain state remains a genuine domain state.

---

**Cue: Moving code between components, changing dependency direction, or widening a contract.** Canonical trigger: changing cohesion, component boundaries, dependency direction, or contracts.

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

**Cue: Refactoring, consolidating duplicated authority, or deleting an obsolete path.** Canonical trigger: deleting obsolete paths, consolidating authority, or refactoring.

### 9.9 Deletion and refactoring

Prefer removing obsolete complexity to layering new complexity on top of it when the requested work makes that removal necessary. If an in-scope change makes code unreachable, a compatibility shim obsolete, an abstraction redundant, or one of several implementations non-authoritative, remove the obsolete path when doing so is safe and within authority. Version control is the archive; commented-out implementations and dead branches are not.

Refactoring is successful when it reduces concepts, code paths, duplicated policy, hidden coupling, unnecessary state, or accidental indirection while preserving required behavior. Fewer lines are not automatically better, and more abstractions are not automatically cleaner.

This is not permission for opportunistic cleanup. Nearby debt unrelated to the requested outcome remains out of scope under `scope.honesty`; report material debt rather than silently expanding the task. Broad cleanup or architectural renovation belongs in an explicit refactoring task with its own scope and verification.

**Cue: Choosing a domain model, ownership, contract, abstraction, or architecture before writing code.** Canonical trigger: choosing or changing domain model, ownership, abstractions, contracts, or architecture.

### 9.10 Make engineering artifacts native to the project

A good implementation should look as though a competent maintainer who understands this repository and domain made the choices deliberately — not like a generic reference implementation transplanted into it.

Before choosing naming, layering, abstractions, error models, configuration shape, test structure, file decomposition, or dependency patterns, learn the project's local grammar where it is sound: existing ownership boundaries, terminology, composition style, error handling, lifecycle, persistence model, testing idioms, and public conventions. Preserve meaningful local identity; do not normalize a distinct system into the generator's preferred architecture.

Local convention is evidence, not authority. Do not cargo-cult broken patterns merely to blend in. When a local pattern conflicts with ownership, invariants, safety, or the requested outcome, fix the underlying model rather than copying either the local defect or a fashionable external pattern.

Reject choices justified only by phrases such as "standard architecture," "best practice," "cleaner pattern," or "more professional" when no concrete property of this system requires them. The relevant question is not whether a pattern is common; it is what problem it solves here and what complexity it removes or prevents.

---
