import { test, expect } from '@playwright/test';

test.describe('Mobile Icons Verification', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display move and shoot icons on mobile', async ({ page }) => {
        await page.goto('/');

        // Hydration wait
        await expect(page.locator('body')).toBeVisible();

        // Verify mobile instructions are visible
        const mobileInstructions = page.locator('#mobile-instructions');
        await expect(mobileInstructions).toBeVisible();

        // Verify Left Icon (Move)
        const leftSvg = mobileInstructions.locator('.icon-graphic').first();
        await expect(leftSvg).toBeVisible();
        // Ensure it has the correct use tag
        await expect(leftSvg.locator('use')).toHaveAttribute('xlink:href', '#icon-joystick-move');
        await expect(mobileInstructions).toContainText('Move (Left Thumb)');

        // Verify Right Icon (Shoot)
        const rightSvg = mobileInstructions.locator('.icon-graphic').nth(1);
        await expect(rightSvg).toBeVisible();
        await expect(rightSvg.locator('use')).toHaveAttribute('xlink:href', '#icon-joystick-aim');
        await expect(mobileInstructions).toContainText('Aim (Right Thumb)');
    });
});
