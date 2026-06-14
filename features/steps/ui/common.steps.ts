import { Given, When, Then, expect } from '@fixtures';

Given('I am on Playwright home page', async ({ page }) => {
  await page.goto('https://playwright.dev');
});

When('I click link {string}', async ({ page }, name: string) => {
  await page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text));
});

Given('I am on Inventory page', async ({ inventoryPage, page }) => {
  await inventoryPage.navigation.goToInventoryPage();
  await expect(page.getByText('Products')).toBeVisible();
});

When('I add item {string} to cart', async ({ inventoryPage }, itemId: string) => {
  await inventoryPage.actions.clickAddToCartButton(itemId);
});

When('I remove item {string} from cart', async ({ inventoryPage }, itemId: string) => {
  await inventoryPage.actions.clickRemoveFromCartButton(itemId);
});

When('I click shopping cart link', async ({ inventoryPage }) => {
  await inventoryPage.actions.clickShoppingCartLink();
});

Then('I see text {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});

// Alias with 'should' phrasing used in some features
Then('I should see text {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});
