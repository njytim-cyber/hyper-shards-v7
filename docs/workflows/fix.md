---
description: Fix bugs, crashes, errors, and failing tests
---

# /fix - Bug Fixing & Debug

**Trigger:** "fix", "bug", "crash", "error", "broken", "debug"

## Step 1: Analyze the Evidence
Read the error message, stack trace, or failing test output.

**Checklist:**
- [ ] What file/line is the error pointing to?
- [ ] Is this a runtime error or build error?
- [ ] Is this a test failure or production crash?

**Common Drift Patterns:**
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Cannot find module` | Import path changed | Update import |
| `Type 'X' is not assignable` | Interface changed | Update types |
| `undefined is not a function` | Method renamed/removed | Check API |
| `Test timeout` | Async issue | Add proper awaits |

**Constraint:** Do not write code yet. Explain the root cause first.

## Step 2: Scope Analysis
1. List all exports from the affected file
2. Find consumers: 
```bash
// turbo
grep -r "import.*ComponentName" src/
```
3. **Safety Check:** Will the fix break consumers?

## Step 3: Targeted Fix
1. Apply the minimum change needed
2. **Constraint:** Do not change the public interface unless explicitly requested
3. **Constraint:** Change minimum lines possible

## Step 4: Verification
```bash
// turbo
npm run build
```

```bash
// turbo
npm run lint
```

## Step 5: Regression Check
If modifying a component that has tests:
```bash
// turbo
npx playwright test
```

**Constraint:** All tests must pass before workflow completes.
