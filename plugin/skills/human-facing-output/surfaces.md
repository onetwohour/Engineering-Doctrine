## 19. Human-facing surfaces

Usability is a correctness property. A feature is not complete if an ordinary user cannot tell what to do, must understand unnecessary implementation concepts, must perform avoidable steps, cannot recover from mistakes, loses work, sees development machinery, or cannot use the feature accessibly.

Ask: What does the person actually see? What will they understand? Is the intended action obvious in this product and context? Can they complete the task without developer knowledge? Can mistakes be recovered safely? Is their work preserved? Is visible complexity genuinely necessary — and is it for the person, or for implementation convenience?

Choose safe defaults. Do not ask users to supply information the system can reliably determine unless explicit choice, consent, authority, preference, or confirmation is itself part of the requirement. Respect people's time: avoid unnecessary clicks, repeated entry, configuration, confirmation, explanation, internal concepts, and recovery steps. Do not expose a configuration option merely because implementing the correct default is harder. The surface reflects how people understand the task, not the database schema or internal state machine.

### 19.1 User-visible states

Where applicable, define: first entry, loading, empty, normal, partial failure, error, recovery, unauthorized. An empty state must be understandable; when a meaningful next action exists, expose it without inventing one merely to fill the screen. A failure state leaves a way to retry, correct, cancel, or recover where such recovery exists — never turn a recoverable failure into an unnecessary fatal exit, and never swallow it silently.

### 19.2 Accessibility

Accessibility is functional correctness: semantic controls; keyboard operation; logical focus, restored after modal interactions; labels on icon-only controls; meaning never carried by color alone; zoom and text scaling supported; errors identify both the field and the remedy; platform conventions followed. Do not regress accessibility merely to simplify implementation.

### 19.3 CLI and developer-facing tools

CLI and developer tools are human-facing surfaces too: readable default output, explicit flags for machine formats, errors on stderr, meaningful exit codes, actionable failure messages, progress for genuinely long operations, interruption without corruption, help written in user concepts. Do not force operators to reverse-engineer internal state to understand normal output.

### 19.4 Development machinery must not leak

Before finishing user-visible work, inspect the real surface for accidental exposure of: debug, test, or staging controls; mock toggles; agent metadata; internal IDs; enum names; class names; database concepts; API field names; environment variables; file paths; stack traces; build metadata; placeholder text; dummy data presented as real.

Invisible testing hooks are acceptable when they do not alter the human experience. Do not reshape human interfaces for automation convenience. When recurring automation materially needs a machine contract, prefer an appropriate machine interface rather than distorting the human interface.
