---
description: Pre-production checks and deployment to production
---

# /deploy - Production Deployment

**Trigger:** "deploy", "release", "ship", "production", "publish"

## Step 1: Clean Build & Integrity
```bash
// turbo
npm ci
```
Verifies `package-lock.json` is consistent.

```bash
// turbo
npm run lint
```

```bash
// turbo
npm run build
```

**If any step fails, STOP and invoke `/fix` workflow.**

## Step 2: Security Audit
```bash
// turbo
npm audit --audit-level=high
```

**Checklist:**
- [ ] No Critical/High vulnerabilities
- [ ] No `.env` files in commit history
- [ ] No hardcoded secrets in code

**Quick Secret Scan:**
```bash
// turbo
grep -rn "sk_\|api_key\|password=" src/ --include="*.ts" --include="*.tsx"
```
If matches found (outside `.env`), STOP and fix.

## Step 3: Version Bump
Open `package.json` and increment version:
- **Patch (x.x.1):** Bug fixes
- **Minor (x.1.0):** New features
- **Major (2.0.0):** Breaking changes

## Step 4: E2E Verification
```bash
// turbo
npx playwright test
```
All tests must pass.

## Step 5: Production Preview
```bash
// turbo
npm run preview
```
Open preview URL and verify:
- [ ] Core game loop works
- [ ] UI renders correctly
- [ ] No console errors

## Step 6: Commit & Push
```bash
git add .
git commit -m "Release v<VERSION>: <DESCRIPTION>"
git push origin main
```

## Step 7: Post-Deployment
1. Monitor build status (Netlify/Vercel/GitHub Actions)
2. Verify live URL
3. Check browser console for errors

---

## Deployment Targets
| Platform | Command |
|----------|---------|
| Netlify | Auto-deploys on push to `main` |
| Vercel | Auto-deploys on push to `main` |
| Desktop (Tauri) | `npm run tauri build` |
| Mobile (Capacitor) | `npx cap sync && npx cap open ios/android` |
