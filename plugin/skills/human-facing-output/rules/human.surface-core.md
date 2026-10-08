## 19. Human-facing surfaces

Usability is a correctness property. A feature is not complete if an ordinary user cannot tell what to do, must understand unnecessary implementation concepts, must perform avoidable steps, cannot recover from mistakes, loses work, sees development machinery, or cannot use the feature accessibly.

Ask: What does the person actually see? What will they understand? Is the intended action obvious in this product and context? Can they complete the task without developer knowledge? Can mistakes be recovered safely? Is their work preserved? Is visible complexity genuinely necessary — and is it for the person, or for implementation convenience?

Choose safe defaults. Do not ask users to supply information the system can reliably determine unless explicit choice, consent, authority, preference, or confirmation is itself part of the requirement. Respect people's time: avoid unnecessary clicks, repeated entry, configuration, confirmation, explanation, internal concepts, and recovery steps. Do not expose a configuration option merely because implementing the correct default is harder. The surface reflects how people understand the task, not the database schema or internal state machine.
