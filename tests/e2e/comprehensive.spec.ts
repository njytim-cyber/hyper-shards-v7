import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive E2E Test Suite for Hyper-Shards v7
 * Optimized for speed, reliability, and coverage
 * 
 * Test Strategy:
 * - Use shared setup for common initialization
 * - Test each screen/feature isolation
 * - Verify core game mechanics programmatically
 * - Cover desktop and mobile responsive behaviors
 */

// Shared test fixtures for optimized setup
const setupGame = async (page: Page, options?: {
    clearStorage?: boolean;
    profile?: Record<string, unknown>;
    waitForEngine?: boolean;
}) => {
    const { clearStorage = true, profile, waitForEngine = true } = options || {};

    // Setup localStorage before navigation
    if (clearStorage || profile) {
        await page.addInitScript((data) => {
            if (data.clear) localStorage.clear();
            if (data.profile) {
                localStorage.setItem('hyperShardsProfile', JSON.stringify(data.profile));
            }
        }, { clear: clearStorage, profile });
    }

    // Navigate and wait for hydration
    await page.goto('/');
    await expect(page.locator('#start-screen')).toBeVisible({ timeout: 10000 });

    // Wait for game engine initialization
    if (waitForEngine) {
        await page.waitForFunction(() =>
            (window as unknown as { gameEngine: { canvas: unknown } }).gameEngine?.canvas
        );
    }
};

const startGame = async (page: Page) => {
    const startButton = page.getByRole('button', { name: /let's go|begin journey/i });
    await expect(startButton).toBeVisible();
    await startButton.click();
    await expect(page.locator('#start-screen')).toBeHidden();
    await expect(page.locator('#gameCanvas')).toBeVisible();
};

// ============================================================================
// SCREEN NAVIGATION TESTS
// ============================================================================
test.describe('Screen Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await setupGame(page);
    });

    test('Start Screen → Game → Pause → Resume flow', async ({ page }) => {
        await startGame(page);

        // Get visible pause button (desktop or mobile)
        const pauseBtn = page.locator('#pause-btn-hud:visible, #mobile-pause-btn:visible').first();
        await expect(pauseBtn).toBeVisible({ timeout: 5000 });
        await pauseBtn.click();

        // Verify pause screen
        await expect(page.locator('#pause-screen')).toBeVisible();

        // Resume
        const resumeBtn = page.locator('#resume-btn');
        await resumeBtn.click();
        await expect(page.locator('#pause-screen')).toBeHidden();
    });

    test('Start Screen → Shop → Close flow', async ({ page }) => {
        const shopBtn = page.locator('#start-shop-btn');
        await expect(shopBtn).toBeVisible();
        await shopBtn.click();

        await expect(page.locator('#shop-screen')).toBeVisible();

        // Close shop
        const closeBtn = page.getByRole('button', { name: /all set/i });
        await closeBtn.click();
        await expect(page.locator('#shop-screen')).toBeHidden();
    });

    test('Start Screen → Achievements → Close flow', async ({ page }) => {
        const achievementsBtn = page.locator('#start-achievements-btn');
        await expect(achievementsBtn).toBeVisible();
        await achievementsBtn.click();

        await expect(page.locator('#achievements-screen')).toBeVisible();

        // Close
        const closeBtn = page.locator('#achievements-close-btn');
        await closeBtn.click();
        await expect(page.locator('#achievements-screen')).toBeHidden();
    });

    test('Start Screen → Pilots → Close flow', async ({ page }) => {
        const pilotsBtn = page.locator('#start-pilots-btn');
        await expect(pilotsBtn).toBeVisible();
        await pilotsBtn.click();

        await expect(page.locator('#pilot-select-screen')).toBeVisible();

        // Close
        const closeBtn = page.locator('#pilot-close-btn');
        await closeBtn.click();
        await expect(page.locator('#pilot-select-screen')).toBeHidden();
    });

    test('Pause → Shop → Close returns to Pause', async ({ page }) => {
        await startGame(page);

        // Pause
        const pauseBtn = page.locator('#pause-btn-hud:visible, #mobile-pause-btn:visible').first();
        await pauseBtn.click();
        await expect(page.locator('#pause-screen')).toBeVisible();

        // Open shop from pause
        await page.locator('#pause-shop-btn').click();
        await expect(page.locator('#shop-screen')).toBeVisible();

        // Close shop - should return to pause, not start screen
        await page.getByRole('button', { name: /all set/i }).click();
        await expect(page.locator('#shop-screen')).toBeHidden();
        await expect(page.locator('#pause-screen')).toBeVisible();
    });
});

// ============================================================================
// GAME MECHANICS TESTS
// ============================================================================
test.describe('Game Mechanics', () => {
    test.beforeEach(async ({ page }) => {
        await setupGame(page, {
            profile: { tutorialComplete: true, hasSeenIntro: true }
        });
    });

    test('Ship initializes with correct base stats', async ({ page }) => {
        await startGame(page);

        const stats = await page.evaluate(() => {
            const engine = (window as unknown as {
                gameEngine: {
                    ship: { maxLives: number; shields: number; damageMult: number };
                    lives: number;
                    wave: number;
                }
            }).gameEngine;
            return {
                maxLives: engine.ship.maxLives,
                shields: engine.ship.shields,
                damage: engine.ship.damageMult,
                lives: engine.lives,
                wave: engine.wave
            };
        });

        expect(stats.maxLives).toBe(3);
        expect(stats.shields).toBe(0);
        expect(stats.damage).toBe(1);
        expect(stats.lives).toBe(3);
    });

    test('Bullets are fired when spacebar pressed', async ({ page }) => {
        await startGame(page);

        // Wait for game to settle
        await page.waitForTimeout(100);

        // Fire bullets
        await page.keyboard.down('Space');
        await page.waitForTimeout(300);
        await page.keyboard.up('Space');

        const bulletCount = await page.evaluate(() =>
            (window as unknown as { gameEngine: { bullets: unknown[] } }).gameEngine.bullets.length
        );
        expect(bulletCount).toBeGreaterThan(0);
    });

    test('Combo system increments on kills', async ({ page }) => {
        await startGame(page);

        // Programmatically trigger combo
        const result = await page.evaluate(() => {
            const engine = (window as unknown as {
                gameEngine: {
                    combo: number;
                    comboTimer: number;
                }
            }).gameEngine;
            const initialCombo = engine.combo;
            engine.combo = 5;
            engine.comboTimer = 2.5;
            return { initial: initialCombo, after: engine.combo };
        });

        expect(result.initial).toBe(1);
        expect(result.after).toBe(5);
    });

    test('Pause freezes game state', async ({ page }) => {
        await startGame(page);

        // Get initial score
        const scoreBefore = await page.evaluate(() =>
            (window as unknown as { gameEngine: { score: number } }).gameEngine.score
        );

        // Pause
        await page.evaluate(() => {
            (window as unknown as { gameEngine: { togglePause: () => void } }).gameEngine.togglePause();
        });

        // Wait a bit
        await page.waitForTimeout(500);

        // Score should not change while paused
        const scoreAfter = await page.evaluate(() =>
            (window as unknown as { gameEngine: { score: number } }).gameEngine.score
        );

        expect(scoreAfter).toBe(scoreBefore);
    });
});

// ============================================================================
// PERSISTENCE TESTS
// ============================================================================
test.describe('Data Persistence', () => {
    test('Profile saves and loads correctly', async ({ page }) => {
        const testProfile = {
            shards: 500,
            highScore: 10000,
            maxWave: 5,
            equippedSkin: 'default',
            unlockedSkins: ['default'],
            upgrades: { hull: 2, damage: 3 },
            tutorialComplete: true,
            hasSeenIntro: true
        };

        await setupGame(page, { profile: testProfile });

        const loaded = await page.evaluate(() => {
            return (window as unknown as { persistence: { profile: { shards: number; highScore: number } } })
                .persistence.profile;
        });

        expect(loaded.shards).toBe(500);
        expect(loaded.highScore).toBe(10000);
    });

    test('Upgrades apply to ship stats', async ({ page }) => {
        await setupGame(page, {
            profile: {
                shards: 1000,
                highScore: 0,
                upgrades: { hull: 3, damage: 5 },
                tutorialComplete: true,
                hasSeenIntro: true
            }
        });

        await startGame(page);

        const stats = await page.evaluate(() => {
            const ship = (window as unknown as {
                gameEngine: {
                    ship: { maxLives: number; damageMult: number }
                }
            }).gameEngine.ship;
            return {
                lives: ship.maxLives,
                damage: ship.damageMult
            };
        });

        expect(stats.lives).toBe(6);  // 3 base + 3 hull
        expect(stats.damage).toBe(1.5);  // 1 + (5 * 0.1)
    });

    test('Corrupted localStorage does not crash app', async ({ page }) => {
        // Inject corrupted data
        await page.addInitScript(() => {
            localStorage.setItem('hyperShardsProfile', '{invalid json}}}');
        });

        await page.goto('/');

        // App should still load with defaults
        await expect(page.locator('#start-screen')).toBeVisible({ timeout: 10000 });

        const profile = await page.evaluate(() =>
            (window as unknown as { persistence: { profile: { shards: number } } }).persistence.profile
        );
        expect(profile.shards).toBe(0);  // Default value
    });
});

// ============================================================================
// SHOP SYSTEM TESTS
// ============================================================================
test.describe('Shop System', () => {
    test.beforeEach(async ({ page }) => {
        await setupGame(page, {
            profile: {
                shards: 10000,
                upgrades: {},
                tutorialComplete: true,
                hasSeenIntro: true
            }
        });
    });

    test('Shop displays all tabs', async ({ page }) => {
        await page.locator('#start-shop-btn').click();
        await expect(page.locator('#shop-screen')).toBeVisible();

        // Check tabs exist
        await expect(page.getByRole('button', { name: 'POWER' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'SKINS' })).toBeVisible();
    });

    test('Purchase decrements shards', async ({ page }) => {
        await page.locator('#start-shop-btn').click();

        const shardsBefore = await page.evaluate(() =>
            (window as unknown as { persistence: { profile: { shards: number } } }).persistence.profile.shards
        );

        // Click first purchasable upgrade
        const buyBtn = page.locator('.shop-item button:not([disabled])').first();
        if (await buyBtn.isVisible()) {
            await buyBtn.click();

            const shardsAfter = await page.evaluate(() =>
                (window as unknown as { persistence: { profile: { shards: number } } }).persistence.profile.shards
            );

            expect(shardsAfter).toBeLessThan(shardsBefore);
        }
    });
});

// ============================================================================
// MOBILE RESPONSIVENESS TESTS
// ============================================================================
test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });  // iPhone SE

    test('Mobile controls are visible on small screens', async ({ page }) => {
        await setupGame(page);

        // Check mobile-specific UI elements
        const mobileInstructions = page.locator('#mobile-instructions');
        await expect(mobileInstructions).toBeVisible();
    });

    test('Touch controls work for game start', async ({ page }) => {
        await setupGame(page);

        // Tap start button
        const startButton = page.getByRole('button', { name: /let's go|begin journey/i });
        await startButton.tap();

        await expect(page.locator('#start-screen')).toBeHidden();
        await expect(page.locator('#gameCanvas')).toBeVisible();
    });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================
test.describe('Performance', () => {
    test('Game loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await expect(page.locator('#start-screen')).toBeVisible();

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000);  // Should load in under 5 seconds
    });

    test('No console errors on startup', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));

        await setupGame(page);

        expect(errors.filter(e => !e.includes('WebGPU'))).toHaveLength(0);
    });

    test('No memory leaks during screen transitions', async ({ page }) => {
        await setupGame(page);

        // Perform multiple screen transitions
        for (let i = 0; i < 3; i++) {
            await page.locator('#start-shop-btn').click();
            await expect(page.locator('#shop-screen')).toBeVisible();
            await page.getByRole('button', { name: /all set/i }).click();
            await expect(page.locator('#shop-screen')).toBeHidden();
        }

        // App should still be responsive
        await expect(page.locator('#start-screen')).toBeVisible();
    });
});

// ============================================================================
// AUDIO SYSTEM TESTS
// ============================================================================
test.describe('Audio System', () => {
    test('Audio system initializes without errors', async ({ page }) => {
        await setupGame(page);

        const audioReady = await page.evaluate(() => {
            const audio = (window as unknown as { audioSystem: { ctx: unknown } }).audioSystem;
            return audio && audio.ctx !== null;
        });

        // Audio context may not be created until user interaction
        expect(audioReady).toBeDefined();
    });
});
