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
