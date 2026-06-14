import { Then, expect } from '@fixtures';

Then('the cart badge should show {string}', async ({ inventoryPage }, expected: string) => {
  const cartBadge = inventoryPage.elements.visualElements.cartBadge();
  await expect(cartBadge).toBeVisible();
  await expect(cartBadge).toHaveText(expected);
});

Then('the cart should be empty', async ({ inventoryPage }) => {
  const cartBadge = inventoryPage.elements.visualElements.cartBadge();
  await expect(cartBadge).toBeHidden();
});
