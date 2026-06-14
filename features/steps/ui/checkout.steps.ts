import { Given, When, Then, expect } from '@fixtures';

When('I click on Checkout button', async ({ checkoutPage }) => {
  await checkoutPage.actions.clickCheckout();
});

When('I fill checkout form with {string} {string} {string}', async ({ checkoutPage }, firstName: string, lastName: string, postalCode: string) => {
  await checkoutPage.actions.fillYourInformation(firstName, lastName, postalCode);
});

When('I continue to overview', async ({ checkoutPage }) => {
  await checkoutPage.actions.continueToOverview();
});

When('I click Continue button', async ({ checkoutPage }) => {
  await checkoutPage.actions.clickContinue();
});

Then('I should see an error message', async ({ checkoutPage }) => {
  await expect(
    checkoutPage.getByText(/Error|First Name is required|Last Name is required|Postal Code is required/i),
  ).toBeVisible();
});
