---
trigger: always_on
---

# 🎮 Hyper-Shards v7 Orchestrator

**Project Stack:** React 19 (Compiler) • Vite 7 • TypeScript 5.9 • Playwright E2E

## Natural Language → Workflow Dispatch

When the user describes a task in plain English, match their intent to the appropriate workflow:

| Intent Keywords | Workflow | Description |
|-----------------|----------|-------------|
| "start", "begin", "session", "health check" | `/start` | Initialize session, run tests, load context |
| "add", "create", "implement", "new", "build" | `/build` | New feature/component implementation |
| "fix", "bug", "crash", "error", "broken", "debug" | `/fix` | Bug fixing & crash resolution |
| "optimize", "refactor", "performance", "balance", "tune", "speed", "clean" | `/tune` | Optimization & game balance tuning |
| "test", "verify", "e2e", "check flow", "browser test" | `/verify` | E2E browser-based verification |
| "deploy", "release", "ship", "production", "publish" | `/deploy` | Pre-production checks & deployment |
| "generate", "sprite", "icon", "image", "audio", "asset" | `/assets` | AI-powered asset generation |
| "document", "docs", "readme", "update docs" | `/docs` | Documentation updates |

### Dispatch Protocol
1. **Parse user input** for intent keywords (case-insensitive)
2. **Match to workflow** using the table above
3. **If ambiguous**, ask: "Did you mean `/build` (new feature) or `/fix` (modify existing)?"
4. **Execute workflow** steps sequentially

---

## Project-Specific Constraints

### Data-Driven Design
- **NEVER** hardcode game values (damage, speed, costs)
- **ALWAYS** import from `src/game/config/` or `src/data/`
- If a value is missing, trigger `/tune` workflow

### Architecture Layers
```
src/
├── components/     # React 19 UI (Views)
│   ├── screens/    # Full-screen views
│   └── ui/         # Reusable UI components
├── game/
│   ├── core/       # Game loop, ECS
│   ├── entities/   # Game objects (Player, Boss, etc.)
│   ├── systems/    # Logic systems (Input, Persistence, etc.)
│   ├── config/     # Game configuration
│   └── utils/      # Game utilities
├── bridges/        # Platform abstraction (Tauri, Capacitor)
├── views/          # WebGPU renderers
└── compute/        # WASM/WebWorker compute
```

### Testing Requirements
- **Unit Tests:** `npm test`
- **E2E Tests:** `npx playwright test`
- **Build Verification:** `npm run build`

---

## Workflow Chains (Common Patterns)

### "I want to add a new enemy type"
```
/build → /verify → /docs
```

### "The boss fight is too hard"
```
/tune (balance mode)
```

### "Ready to ship this update"
```
/verify → /deploy
```

### "Something's broken after the last change"
```
/fix → /verify
```

---

## Verification Standard (The Green State)

Every workflow MUST end with verification:
- [ ] `npm run build` exits 0
- [ ] `npm run lint` shows no errors
- [ ] Affected tests pass

**Failure Protocol:** If verification fails, do NOT proceed. Report the error and proposed fix.

---

## Security Protocol

1. **Secrets:** `.env` only, never commit
2. **No `dangerouslySetInnerHTML`**
3. **No `eval()` or dynamic code execution**
4. **Client-side SQL forbidden** (use Supabase SDK with RLS)
