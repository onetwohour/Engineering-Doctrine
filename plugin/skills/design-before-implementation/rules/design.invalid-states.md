### 9.2 Make invalid states hard to represent

```text
✗ is_loading, is_loaded, has_error, is_empty     six of sixteen
                                                  combinations meaningless
✓ state: Loading | Loaded(items) | Failed(reason)

```

Prefer one authoritative value over synchronized copies, domain types over ambiguous primitives, explicit states over combinations of booleans, explicit transitions over implicit mutation, constrained construction over partial initialization, typed boundaries over string conventions. Use type machinery where it materially improves correctness, not as decoration.
