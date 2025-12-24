---
description: Initialize coding session, run health checks, load project context
---

# /start - Session Startup

**Trigger:** "start", "begin", "session", "health check", "let's go"

## Step 1: Health Check
```bash
// turbo
npm run build
```
If build fails, STOP and invoke `/fix` workflow.

## Step 2: Test Suite
```bash
// turbo
npm run lint
```

## Step 3: Context Loading
Read the following files to understand the current project state:
1. `docs/component_glossary.md` - Component inventory
2. `docs/architecture/` - System architecture
3. `src/game/config/` - Game configuration

## Step 4: Ready State
Output: "✅ Hyper-Shards v7 ready. Build: ✓ | Lint: ✓ | Context: Loaded"

---

## Quick Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (localhost:5173) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npx playwright test` | E2E tests |
