import { Given, When, Then, expect } from '@fixtures';

Given('I go to login page', async ({ loginPage }) => {
  await loginPage.navigation.goToLoginPage();
});

When('I login with default credentials', async ({ loginPage }) => {
  await loginPage.login(process.env.USER_NAME!, process.env.USER_PASSWORD!);
});
