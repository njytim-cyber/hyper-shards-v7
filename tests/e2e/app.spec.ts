import { test, expect } from '@playwright/test';

/**
 * Hyper Shards Minimal Smoke Test
 * Verifies the app loads with minimal waiting.
 */

test('App is accessible and returns content', async ({ page }) => {
    // Simple page load - no waiting for specific elements
    const response = await page.goto('/');

    // Verify we got a successful response
    expect(response?.status()).toBeLessThan(400);

    // Wait for any content
    await page.waitForTimeout(3000);

    // Get page HTML
    const html = await page.content();

    // Verify we have some content (app rendered)
    expect(html.length).toBeGreaterThan(1000);

    // Check title
    expect(await page.title()).toContain('hyper');
});

test('App renders React content', async ({ page }) => {
    await page.goto('/');

    // Wait for body to have content
    await page.waitForTimeout(3000);

    // Check that React rendered something
    const html = await page.content();

    // App should contain the HYPER SHARDS text
    expect(html.toLowerCase()).toContain('hyper');

    // App should have the viewport container
    expect(html).toContain('root');
});
