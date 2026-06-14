import { Given, When, Then, expect } from '@fixtures';

// Module-specific assertion for cart
Then('I should see cart title {string}', async ({ cartPage }, expected: string) => {
  await expect(cartPage.elements.visualElements.cartTitle()).toBeVisible();
  await expect(cartPage.elements.visualElements.cartTitle()).toHaveText(expected);
});
