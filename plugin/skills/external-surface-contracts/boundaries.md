## 14. Boundary contracts

Determine the real contract of external data before using it: user input, files, databases, network responses, third-party APIs, IPC, serialized formats, configuration, environment variables, subprocess output, plugins, model output.

At the boundary: parse explicitly, validate required fields, constrain ranges, distinguish missing from invalid, reject impossible states, prefer typed or generated clients where appropriate, parameterize database and command interfaces.

```text
✗ every caller improvises:   name = response?.user?.name ?? "unknown"
✓ the boundary owns it:      user = UserSchema.parse(response.user)

```

Scattered optional chaining, blanket exception handling, and default-empty fallbacks are not substitutes for understanding the contract. Validate once at the correct boundary where practical.

---
