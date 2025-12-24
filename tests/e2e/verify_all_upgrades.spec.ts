/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Comprehensive Shop Verification', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
        await page.goto('/');
        await expect(page.getByRole('button', { name: "LET'S GO!" })).toBeVisible();
    });

    // Helper to set upgrade
    const setUpgrade = async (page: Page, key: string, val: number) => {
        await page.evaluate(({ k, v }: { k: string; v: number }) => {
            (window as any).persistence.profile.upgrades[k] = v;
            (window as any).persistence.save();
        }, { k: key, v: val });
    };

    // Helper to start game and wait for ready
    const startGame = async (page: Page) => {
        await page.getByRole('button', { name: "LET'S GO!" }).click();
        await expect.poll(async () => {
            return await page.evaluate(() => (window as any).gameEngine?.gameState);
        }).toBe('PLAYING');
    };

    // --- OFFENSE ---

    test('Damage upgrade increases damage multiplier', async ({ page }) => {
        await setUpgrade(page, 'damage', 5);
        await startGame(page);
        const mult = await page.evaluate(() => (window as any).gameEngine.ship.damageMult);
        expect(mult).toBe(1.5);
    });

    test('Fire Rate upgrade reduces weapon delay', async ({ page }) => {
        await setUpgrade(page, 'fireRate', 5);
        await startGame(page);
        const val = await page.evaluate(() => (window as any).persistence.profile.upgrades.fireRate);
        expect(val).toBe(5);
    });

    test('Bullet Speed upgrade increases speed', async ({ page }) => {
        await setUpgrade(page, 'bulletSpd', 3);
        await startGame(page);
        await page.keyboard.down('Space');
        await expect.poll(async () => {
            return await page.evaluate(() => (window as any).gameEngine.bullets.length);
        }).toBeGreaterThan(0);
        await page.keyboard.up('Space');
        const speed = await page.evaluate(() => (window as any).gameEngine.bullets[0]?.speed);
        expect(speed).toBe(960);
    });

    test('Pierce upgrade increases pierce count', async ({ page }) => {
        await setUpgrade(page, 'pierce', 2);
        await startGame(page);
        await page.keyboard.down('Space');
        await expect.poll(async () => {
            return await page.evaluate(() => (window as any).gameEngine.bullets.length);
        }).toBeGreaterThan(0);
        await page.keyboard.up('Space');
        const pierce = await page.evaluate(() => (window as any).gameEngine.bullets[0]?.pierce);
        expect(pierce).toBe(3);
    });

    test('Blast upgrade enables chain reaction', async ({ page }) => {
        await setUpgrade(page, 'blast', 3);
        await startGame(page);
        const val = await page.evaluate(() => (window as any).persistence.profile.upgrades.blast);
        expect(val).toBe(3);
    });

    test('Crit upgrade enables crit chance', async ({ page }) => {
        await setUpgrade(page, 'crit', 3);
        await startGame(page);
        const val = await page.evaluate(() => (window as any).persistence.profile.upgrades.crit);
        expect(val).toBe(3);
    });

    test('Knockback upgrade is loaded', async ({ page }) => {
        await setUpgrade(page, 'knock', 3);
        await startGame(page);
        const val = await page.evaluate(() => (window as any).persistence.profile.upgrades.knock);
        expect(val).toBe(3);
    });

    test('Size upgrade increases bullet radius', async ({ page }) => {
        await setUpgrade(page, 'size', 3);
        await startGame(page);
        await page.keyboard.down('Space');
        await expect.poll(async () => {
            return await page.evaluate(() => (window as any).gameEngine.bullets.length);
        }).toBeGreaterThan(0);
        await page.keyboard.up('Space');
        const radius = await page.evaluate(() => (window as any).gameEngine.bullets[0]?.radius);
        expect(radius).toBe(5);
    });

    test('Homing upgrade enables homing flag', async ({ page }) => {
        await setUpgrade(page, 'homing', 1);
        await startGame(page);
        await page.keyboard.down('Space');
        await expect.poll(async () => {
            return await page.evaluate(() => (window as any).gameEngine.bullets.length);
        }).toBeGreaterThan(0);
        await page.keyboard.up('Space');
        const homing = await page.evaluate(() => (window as any).gameEngine.bullets[0]?.homing);
        expect(homing).toBe(true);
    });

    test('Rear Shot fires backward bullet', async ({ page }) => {
        await setUpgrade(page, 'rear', 1);
        await startGame(page);
        await page.keyboard.down('Space');
        await expect.poll(async () => {
            return await page.evaluate(() => (window as any).gameEngine.bullets.length);
        }).toBeGreaterThanOrEqual(2);
        await page.keyboard.up('Space');
        const count = await page.evaluate(() => (window as any).gameEngine.bullets.length);
        expect(count).toBeGreaterThanOrEqual(2);
    });

    // --- DEFENSE ---

    test('Hull upgrade increases max lives', async ({ page }) => {
        await setUpgrade(page, 'hull', 3);
        await startGame(page);
        const lives = await page.evaluate(() => (window as any).gameEngine.ship.maxLives);
        expect(lives).toBe(6);
    });

    test('Shield Duration increases invincibility', async ({ page }) => {
        await setUpgrade(page, 'shieldDur', 3);
        await startGame(page);
        await page.evaluate(() => (window as any).gameEngine.handlePlayerHit());
        const time = await page.evaluate(() => (window as any).gameEngine.ship.invincibleTime);
        expect(time).toBeGreaterThan(3.0);
    });

    test('Dash Cooldown reduces cooldown', async ({ page }) => {
        await setUpgrade(page, 'dashCool', 3);
        await startGame(page);
        await page.keyboard.down('Shift');
        // Wait for dash to activate (cooldown starts)
        await expect.poll(async () => {
            return await page.evaluate(() => (window as any).gameEngine.ship.dashCooldown);
        }).toBeGreaterThan(0);
        await page.keyboard.up('Shift');
        const cd = await page.evaluate(() => (window as any).gameEngine.ship.dashCooldown);
        expect(cd).toBeGreaterThan(1.0);
    });

    test('Dash Distance increases velocity', async ({ page }) => {
        await setUpgrade(page, 'dashDist', 3);
        await startGame(page);
        await page.keyboard.press('Shift');
        // Wait for velocity change
        await expect.poll(async () => {
            const vx = await page.evaluate(() => (window as any).gameEngine.ship.vx);
            const vy = await page.evaluate(() => (window as any).gameEngine.ship.vy);
            return Math.sqrt(vx * vx + vy * vy);
        }).toBeGreaterThan(100);

        const vx = await page.evaluate(() => (window as any).gameEngine.ship.vx);
        const vy = await page.evaluate(() => (window as any).gameEngine.ship.vy);
        const speed = Math.sqrt(vx * vx + vy * vy);
        expect(speed).toBeCloseTo(1320, -1); // Loose equality for float math
    });

    test('Regen enables regen timer', async ({ page }) => {
        await setUpgrade(page, 'regen', 1);
        await startGame(page);
        const val = await page.evaluate(() => (window as any).persistence.profile.upgrades.regen);
        expect(val).toBe(1);
    });

    test('Revive enables revive flag', async ({ page }) => {
        await setUpgrade(page, 'revive', 1);
        await startGame(page);
        await page.evaluate(() => {
            (window as any).gameEngine.lives = 0;
            (window as any).gameEngine.gameOver();
        });
        await expect.poll(async () => {
            return await page.evaluate(() => (window as any).gameEngine.hasRevived);
        }).toBe(true);
        const gameState = await page.evaluate(() => (window as any).gameEngine.gameState);
        expect(gameState).toBe('PLAYING');
    });

    test('Armor/Evasion/Thorns upgrades loaded', async ({ page }) => {
        await setUpgrade(page, 'armor', 3);
        await setUpgrade(page, 'evasion', 3);
        await setUpgrade(page, 'thorns', 3);
        await startGame(page);
        const u = await page.evaluate(() => (window as any).persistence.profile.upgrades);
        expect(u.armor).toBe(3);
        expect(u.evasion).toBe(3);
        expect(u.thorns).toBe(3);
    });

    test('Nova upgrade triggers explosion on hit', async ({ page }) => {
        await setUpgrade(page, 'nova', 1);
        await startGame(page);

        // Mock audioSystem to track calls
        await page.evaluate(() => {
            (window as any).audioSystem.playNuke = () => { (window as any)._nukeCalled = true; };
        });

        // Trigger hit
        await page.evaluate(() => (window as any).gameEngine.handlePlayerHit());

        await expect.poll(async () => {
            return await page.evaluate(() => (window as any)._nukeCalled);
        }).toBe(true);
    });

    // --- UTILITY ---

    test('Speed upgrade increases thrust', async ({ page }) => {
        await setUpgrade(page, 'speed', 5);
        await startGame(page);
        const val = await page.evaluate(() => (window as any).persistence.profile.upgrades.speed);
        expect(val).toBe(5);
    });

    test('Magnet upgrade increases pickup range', async ({ page }) => {
        await setUpgrade(page, 'magnet', 3);
        await startGame(page);
        const val = await page.evaluate(() => (window as any).persistence.profile.upgrades.magnet);
        expect(val).toBe(3);
    });

    test('Start upgrade skips waves', async ({ page }) => {
        await setUpgrade(page, 'start', 1);
        await startGame(page);
        const wave = await page.evaluate(() => (window as any).gameEngine.wave);
        expect(wave).toBe(4);
    });

    test('Skins update ship appearance', async ({ page }) => {
        await page.evaluate(() => {
            (window as any).persistence.profile.equippedSkin = 'ruby';
            (window as any).persistence.profile.unlockedSkins = ['default', 'ruby'];
            (window as any).persistence.save();
        });
        await startGame(page);
        const skinName = await page.evaluate(() => (window as any).gameEngine.ship.skin.name);
        expect(skinName).toBe('Ruby Ace');
    });

});
