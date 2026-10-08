### 19.1 User-visible states

Where applicable, define: first entry, loading, empty, normal, partial failure, error, recovery, unauthorized. An empty state must be understandable; when a meaningful next action exists, expose it without inventing one merely to fill the screen. A failure state leaves a way to retry, correct, cancel, or recover where such recovery exists — never turn a recoverable failure into an unnecessary fatal exit, and never swallow it silently.
