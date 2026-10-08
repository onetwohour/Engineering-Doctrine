### 20.1 Errors

Human-facing errors communicate: what did not happen; why, if known; what the person can do next.

```text
✗ Error: ECONNREFUSED at line 42
✓ Couldn't connect to the server. Try again.
```

Do not invent a cause when it is unknown — a correct next step beats a guessed explanation. Do not show ordinary users unnecessary stack traces, raw exceptions, file paths, internal IDs, enum names, class names, API fields, or credentials.
