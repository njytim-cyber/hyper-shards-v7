---
description: Add new feature, component, or system to the game
---

# /build - New Feature Implementation

**Trigger:** "add", "create", "implement", "new", "build"

## Step 1: Context & Contract
Before writing ANY code, output:
1. **Location:** Where will this file live? (Use architecture layer)
2. **Interface:** Define the TypeScript interface/type for props/params
3. **Dependencies:** What existing modules will this import?
4. **Duplication Check:** Does this duplicate anything in `docs/component_glossary.md`?

**Wait for user approval before proceeding.**

## Step 2: Atomic Implementation
1. Create the component/module as a pure ESM
2. **Constraint:** Follow the architecture layer separation:
   - UI → `src/components/`
   - Game Logic → `src/game/`
   - Platform → `src/bridges/`
3. **Constraint:** Do not integrate into parent yet

## Step 3: Type Safety
1. Ensure all exports have explicit TypeScript types
2. No `any` types allowed (use `unknown` if necessary)
3. **Data-Driven:** Import game values from config, never hardcode

## Step 4: Integration
1. Show the exact `import` statement for the parent
2. Verify no circular dependencies with:
```bash
// turbo
npx madge --circular src/
```

## Step 5: Verification
```bash
// turbo
npm run build
```

## Step 6: Update Glossary
Add the new component to `docs/component_glossary.md`:
```markdown
| ComponentName | src/path/to/file.tsx | Brief description |
```
