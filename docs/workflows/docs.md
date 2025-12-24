---
description: Update documentation, README, component glossary
---

# /docs - Documentation Updates

**Trigger:** "document", "docs", "readme", "update docs"

## Step 1: Identify Scope
What needs documenting?

| Type | Location | When to Update |
|------|----------|----------------|
| Component added | `docs/component_glossary.md` | After `/build` workflow |
| Architecture change | `docs/architecture/` | Major refactors |
| API change | README or inline JSDoc | Interface modifications |
| Workflow change | `docs/workflows/` | Process updates |

## Step 2: Component Glossary Update
If a new component was added, update `docs/component_glossary.md`:

```markdown
| Component | Path | Description |
|-----------|------|-------------|
| NewComponent | `src/components/NewComponent.tsx` | Brief description |
```

## Step 3: Architecture Diagram Update
If system architecture changed, update relevant diagram in `docs/architecture/`:
- Dependency graphs
- Data flow diagrams
- Layer diagrams

## Step 4: Inline Documentation
For TypeScript interfaces and functions:
```typescript
/**
 * Brief description of what this does.
 * @param paramName - Description of parameter
 * @returns Description of return value
 */
```

## Step 5: README Updates
If user-facing features changed:
1. Update feature list
2. Update usage examples
3. Update screenshots if UI changed

## Step 6: Auto-Documentation
If the project has auto-docs configured:
```bash
// turbo
npm run docs
```

---

## Documentation Standards
- **Present tense:** "Renders a button" not "Will render"
- **Active voice:** "The component handles..." not "Is handled by..."
- **Code examples:** Include for complex APIs
- **Links:** Cross-reference related components
