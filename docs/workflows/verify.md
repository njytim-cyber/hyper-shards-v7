---
description: E2E browser-based verification with Playwright
---

# /verify - E2E Verification

**Trigger:** "test", "verify", "e2e", "check flow", "browser test"

## Step 1: Server Check
Ensure dev server is running:
```bash
// turbo
npm run dev
```
Wait for `localhost:5173` to be available.

## Step 2: Playwright Config Verification
Ensure `playwright.config.ts` has optimal settings:
- `fullyParallel: true` - Run tests concurrently
- `timeout: 120 * 1000` - 2 min per test
- `reuseExistingServer: true` - Instant connection

## Step 3: Write/Update Test
If creating a new test, place it in `tests/e2e/`.

**Paranoid Rules (Prevent Flake):**
1. **No sleeps:** Never use `page.waitForTimeout()`
2. **Hydration wait:** Start with `await expect(page.locator('body')).toBeVisible()`
3. **Actionability:** Assert visibility BEFORE clicking
   ```typescript
   // ❌ Bad
   await page.getByRole('button').click()
   
   // ✅ Good
   const btn = page.getByRole('button', { name: 'Start' });
   await expect(btn).toBeVisible();
   await btn.click();
   ```
4. **Resilient Selectors:**
   - Priority 1: `getByRole()` (Accessible)
   - Priority 2: `getByTestId()` (Stable)
   - **BANNED:** CSS selectors like `div > div.active`

## Step 4: Execute Tests
```bash
// turbo
npx playwright test --workers=100%
```

## Step 5: Failure Analysis
If tests fail:
1. **Do NOT just re-run**
2. Analyze the specific timeout/assertion error
3. Check: Did we click before data loaded?
4. Add explicit waits for loading states

## Step 6: Success State
Output: "✅ E2E Verification Complete. [X/X] tests passed."
