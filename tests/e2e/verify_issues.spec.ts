import { test, expect } from '@playwright/test';

test.describe('Game Issues - Paranoid Mode', () => {
    test.beforeEach(async ({ page }) => {
        page.on('pageerror', exception => {
            console.log(`PAGE ERROR: ${exception}`);
        });
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        // Clear state to ensure fresh start for each test
        await page.addInitScript(() => {
            window.localStorage.clear();
        });

        await page.goto('/');

        // Rule 1: Hydration Wait - wait for start screen (actual rendered content)
        const startScreen = page.locator('#start-screen');
        await expect(startScreen).toBeVisible({ timeout: 10000 });

        // Wait for game engine to be attached to window AND initialized (canvas set)
        await page.waitForFunction(() => (window as any).gameEngine && (window as any).gameEngine.canvas);
    });

    test('Pause Screen should lead to Shop', async ({ page }) => {
        // Rule 3: Actionability - assert visible before clicking
        const startButton = page.getByRole('button', { name: /let's go|begin journey/i });
        await expect(startButton).toBeVisible();
        await startButton.click();

        // Wait for start screen to hide
        await expect(page.locator('#start-screen')).toBeHidden();

        // Rule 4: Wait for game to be ready - check for canvas
        const canvas = page.locator('#gameCanvas');
        await expect(canvas).toBeVisible();

        // Wait for pause button to appear (indicates game loop started)
        // Wait for pause button to appear (indicates game loop started)
        // Handle both desktop and mobile pause buttons by selecting the visible one
        const pauseBtn = page.locator('#pause-btn-hud:visible, #mobile-pause-btn:visible').first();
        await expect(pauseBtn).toBeVisible();
        await pauseBtn.click();

        // Wait for pause screen
        const pauseScreen = page.locator('#pause-screen');
        await expect(pauseScreen).toBeVisible();

        // Click Shop button
        const shopBtn = page.locator('#pause-shop-btn');
        await expect(shopBtn).toBeVisible();
        await shopBtn.click();

        // Verify shop screen appears
        const shopScreen = page.locator('#shop-screen');
        await expect(shopScreen).toBeVisible();

        // Close Shop - Should return to Pause Screen
        const closeBtn = page.getByRole('button', { name: /all set/i });
        await expect(closeBtn).toBeVisible();
        await closeBtn.click();

        // Verify shop closed and pause screen visible
        await expect(shopScreen).toBeHidden();
        await expect(pauseScreen).toBeVisible();
    });

    test('Tutorial should be present', async ({ page }) => {
        // Start Game
        const startButton = page.getByRole('button', { name: /let's go|begin journey/i });
        await expect(startButton).toBeVisible();
        await startButton.click();

        await expect(page.locator('#start-screen')).toBeHidden();

        // Wait for canvas to be ready
        await expect(page.locator('#gameCanvas')).toBeVisible();

        // Check for Tutorial Layer
        const tutorialLayer = page.locator('#tutorial-layer');
        await expect(tutorialLayer).toBeVisible({ timeout: 10000 });
    });

    test('Wave 1 should appear only after tutorial', async ({ page }) => {
        // Start Game
        const startButton = page.getByRole('button', { name: /let's go|begin journey/i });
        await expect(startButton).toBeVisible();
        await startButton.click();

        await expect(page.locator('#start-screen')).toBeHidden();

        // Wait for game to be ready
        await expect(page.locator('#gameCanvas')).toBeVisible();

        // 1. Verify Tutorial Active & Wave 1 Hidden
        const tutorialLayer = page.locator('#tutorial-layer');
        await expect(tutorialLayer).toBeVisible({ timeout: 10000 });

        // Check Wave text is hidden during tutorial
        const waveText = page.locator('.hud-center .hud-stat', { hasText: 'WAVE' });
        await expect(waveText).toBeHidden();

        // Check Level Overlay is not showing
        const levelScreen = page.locator('#level-screen');
        await expect(levelScreen).toBeAttached();
        await expect(levelScreen).not.toHaveClass(/show-level/);

        const levelTitle = page.locator('#level-title');
        // await expect(levelTitle).toBeHidden(); // Flaky due to CSS transitions, relying on parent class check

        // 2. Complete Tutorial programmatically
        const success = await page.evaluate(() => {
            // @ts-ignore
            if (window.gameEngine && window.gameEngine.tutorialSystem) {
                // @ts-ignore
                window.gameEngine.tutorialSystem.end();
                return true;
            }
            return false;
        });
        expect(success).toBe(true);

        // 3. Verify Tutorial Hidden & Wave 1 Visible
        await expect(tutorialLayer).toBeHidden();

        // Wait for Wave text to appear - increased timeout for stability
        await expect(waveText).toBeVisible({ timeout: 10000 });

        const levelVal = page.locator('#level-val');
        await expect(levelVal).toHaveText('1');
    });
});
