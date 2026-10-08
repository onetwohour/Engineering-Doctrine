### 19.4 Development machinery must not leak

Before finishing user-visible work, inspect the real surface for accidental exposure of: debug, test, or staging controls; mock toggles; agent metadata; internal IDs; enum names; class names; database concepts; API field names; environment variables; file paths; stack traces; build metadata; placeholder text; dummy data presented as real.

Invisible testing hooks are acceptable when they do not alter the human experience. Do not reshape human interfaces for automation convenience. When recurring automation materially needs a machine contract, prefer an appropriate machine interface rather than distorting the human interface.
