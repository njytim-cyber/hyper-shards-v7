---
description: Optimize performance, refactor code, or tune game balance
---

# /tune - Optimization & Balance

**Trigger:** "optimize", "refactor", "performance", "balance", "tune", "speed", "clean"

This workflow has two modes:

## Mode A: Performance Optimization
Use when: "slow", "performance", "optimize", "refactor"

### Step A1: The Audit (Non-Destructive)
Read the target file(s) and analyze for:

| Category | What to Look For |
|----------|------------------|
| **Performance** | Unnecessary re-renders, expensive calculations in loops, missing `useMemo`/`useCallback` |
| **Bundle Size** | Heavy library imports for simple tasks |
| **Readability** | Magic numbers, deep nesting, DRY violations |
| **Accessibility** | Missing `aria-labels`, semantic HTML issues |

**Output:** List top 3 improvement opportunities. **Wait for approval.**

### Step A2: The Refactor
1. Apply approved optimizations
2. **Constraint:** External behavior (inputs/outputs) must remain EXACTLY the same
3. **Constraint:** If using `React.memo` or `useMemo`, explain why it's needed

### Step A3: Verification
```bash
// turbo
npm run build
```

---

## Mode B: Game Balance Tuning
Use when: "balance", "too hard", "too easy", "damage", "speed", "cost"

### Step B1: Locate Config
Find the relevant configuration in:
- `src/game/config/` - Game configuration files
- `src/data/` - Data files (if they exist)

### Step B2: Identify Value
Map the user's request to a specific config key:
| User Says | Config Location |
|-----------|-----------------|
| "boss is too hard" | Boss health/damage values |
| "player too slow" | Player speed values |
| "too expensive" | Cost/economy values |

### Step B3: Update Value
Modify the JSON/config. Ensure schema structure is preserved.

### Step B4: Hot Reload
Output: "✅ Balance updated. Value changed: [KEY] from [OLD] to [NEW]"

---

## DRY Refactoring Checklist
When consolidating duplicate code:
- [ ] Extract to a shared utility in `src/game/utils/` or `src/utils/`
- [ ] Update all consumers to use the new utility
- [ ] Verify no import cycles introduced
