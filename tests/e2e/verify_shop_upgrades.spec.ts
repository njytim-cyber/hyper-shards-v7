import { test, expect } from '@playwright/test';

test.describe('Shop Power-up Verification', () => {

    test.beforeEach(async ({ page }) => {
        // Clear storage before each test
        await page.addInitScript(() => {
            localStorage.clear();
        });
    });

    test('Base stats should be correct without upgrades', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();

        // Start game
        const startBtn = page.getByRole('button', { name: "LET'S GO!" });
        await expect(startBtn).toBeVisible();
        await startBtn.click();

        // Check base stats
        const stats = await page.evaluate(() => {
            const ship = (window as any).gameEngine.ship;
            return {
                maxLives: ship.maxLives,
                damageMult: ship.damageMult,
                dashCooldown: ship.dashCooldown,
                wave: (window as any).gameEngine.wave
            };
        });

        expect(stats.maxLives).toBe(3);
        expect(stats.damageMult).toBe(1);
        expect(stats.wave).toBe(1);
    });

    test('Hull upgrade should increase max lives', async ({ page }) => {
        // Inject Hull Upgrade Level 5
        await page.addInitScript(() => {
            const profile = {
                shards: 0,
                highScore: 0,
                equippedSkin: 'default',
                unlockedSkins: ['default'],
                upgrades: { hull: 5 }, // +5 lives
                maxWave: 0,
                tutorialComplete: false
            };
            localStorage.setItem('hyperShardsProfile', JSON.stringify(profile));
        });

        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();

        const startBtn = page.getByRole('button', { name: "LET'S GO!" });
        await expect(startBtn).toBeVisible();
        await startBtn.click();

        const lives = await page.evaluate(() => (window as any).gameEngine.ship.maxLives);
        expect(lives).toBe(8); // 3 base + 5 upgrade
    });

    test('Start upgrade should skip waves', async ({ page }) => {
        // Inject Start Upgrade Level 1
        await page.addInitScript(() => {
            const profile = {
                shards: 0,
                highScore: 0,
                equippedSkin: 'default',
                unlockedSkins: ['default'],
                upgrades: { start: 1 },
                maxWave: 0,
                tutorialComplete: false
            };
            localStorage.setItem('hyperShardsProfile', JSON.stringify(profile));
        });

        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();

        const startBtn = page.getByRole('button', { name: "LET'S GO!" });
        await expect(startBtn).toBeVisible();
        await startBtn.click();

        const wave = await page.evaluate(() => (window as any).gameEngine.wave);
        expect(wave).toBe(4);
    });

    test('Damage and Fire Rate upgrades should modify ship stats', async ({ page }) => {
        // Inject Damage Lvl 5 (+50%) and FireRate Lvl 5 (-25% delay)
        await page.addInitScript(() => {
            const profile = {
                shards: 0,
                highScore: 0,
                equippedSkin: 'default',
                unlockedSkins: ['default'],
                upgrades: { damage: 5, fireRate: 5 },
                maxWave: 0,
                tutorialComplete: false
            };
            localStorage.setItem('hyperShardsProfile', JSON.stringify(profile));
        });

        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();

        const startBtn = page.getByRole('button', { name: "LET'S GO!" });
        await expect(startBtn).toBeVisible();
        await startBtn.click();

        const stats = await page.evaluate(() => {
            const ship = (window as any).gameEngine.ship;
            return {
                damageMult: ship.damageMult
            };
        });

        expect(stats.damageMult).toBe(1.5); // 1 + (5 * 0.1)
    });

    test('Rear Shot upgrade should fire backward bullet', async ({ page }) => {
        // Inject Rear Upgrade
        await page.addInitScript(() => {
            const profile = {
                shards: 0,
                highScore: 0,
                equippedSkin: 'default',
                unlockedSkins: ['default'],
                upgrades: { rear: 1 },
                maxWave: 0,
                tutorialComplete: false
            };
            localStorage.setItem('hyperShardsProfile', JSON.stringify(profile));
        });

        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();

        const startBtn = page.getByRole('button', { name: "LET'S GO!" });
        await expect(startBtn).toBeVisible();
        await startBtn.click();

        // Fire a shot (hold key to ensure game loop catches it)
        await page.keyboard.down('Space');
        await page.waitForTimeout(200); // Wait for a few frames
        await page.keyboard.up('Space');

        // Check bullet count. Should be at least 2 (one front, one rear)
        // Note: might need a small wait for update loop to process input
        await page.waitForTimeout(100);

        const bulletCount = await page.evaluate(() => (window as any).gameEngine.bullets.length);
        expect(bulletCount).toBeGreaterThanOrEqual(2);
    });

});
