<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Quality Gate Subagents

This project uses two read-only subagents as quality gates. They live in `.claude/agents/` and are automatically available for delegation.

### Available subagents

| Subagent | Model | What it checks |
|---|---|---|
| `reviewer` | Opus | Architecture, tenant scoping, TypeScript strict, PT-BR copy, component reuse, Next.js 16 patterns, code conventions |
| `design-system-checker` | Sonnet | Hardcoded colors/spacing/radii/shadows, design token usage, component spec compliance, status color mapping, locale formatting |

### Implementation workflow

When implementing any feature or screen, follow this sequence:

1. **Read first** — Read the relevant plan doc (`docs/0X-*.md`) and `docs/design-system.md` before writing code
2. **Implement** — Build the feature following CLAUDE.md conventions
3. **Lint** — Run `yarn lint` and fix any issues
4. **Review** — Delegate to the `reviewer` subagent to check the implementation
5. **Design check** — Delegate to the `design-system-checker` subagent to validate UI compliance
6. **Fix** — Address any CRITICAL and HIGH issues found by either subagent
7. **Report** — Present findings and fixes to the user

### Subagent constraints

- Both subagents are **read-only** — they report findings but cannot edit files
- The main session must fix any issues they find
- Neither subagent should try to read `design.pen` — it's encrypted
- Neither subagent can spawn other subagents

---

## Usage Guide

### What are subagents?

Subagents are specialized AI assistants that run in their own context window. They have a focused system prompt, restricted tool access, and return a summary of their findings. The main session delegates to them when a task matches their description.

### How to trigger subagents

**Automatic:** Claude will auto-delegate when your prompt matches a subagent's description. After implementing UI code, Claude may automatically invoke the design-system-checker.

**Manual (recommended for quality gates):** Tell Claude explicitly:

```
Use the reviewer agent to check the code I just wrote
```

```
Use the design-system-checker to validate the UI
```

```
Run both quality gate agents on the recent changes
```

### Typical session workflow

Here's what a productive implementation session looks like:

```
You:    "Implement Screen 3 (Orders Kanban) per docs/03-orders-kanban.md"

Claude: [reads plan doc + design-system.md]
        [implements the screen]
        [runs yarn lint]
        [delegates to reviewer -> gets structured report]
        [delegates to design-system-checker -> gets compliance report]
        [fixes any CRITICAL/HIGH issues]
        [reports: "Done. Reviewer found 0 critical, 1 warning (fixed). 
         Design system check passed."]

You:    [review the code, commit]
```

### Managing subagents

- `/agents` — Open the subagent management UI (view, edit, create, delete)
- Subagent files live in `.claude/agents/` and can be edited directly
- Changes to subagent files take effect on the next session (or reload via `/agents`)
