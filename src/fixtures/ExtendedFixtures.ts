import {
  calculatorSchema,
  calculatorSoapData,
  capitalCitySchema,
  checkoutData,
  contactSchema,
  contactsData,
  contactsListSchema,
  countryInfoSoapData,
  countryNameSchema,
  healthSchema,
  numberConversionSoapData,
  numberToDollarsSchema,
  numberToWordsSchema,
  profileSchema,
  profilesData,
  userSchema,
  usersData,
  usersListSchema,
} from '@data';
import { Fixtures } from '@fixtures';
import { CartPage, CheckoutPage, HomePage, InventoryPage, LoginPage } from '@pages';
import type { Page, TestInfo } from '@playwright/test';
import { expect as baseExpect } from '@playwright/test';
import { test as baseTest, createBdd } from 'playwright-bdd';

import {
  ApiClient,
  ApolloClient,
  ARTIFACTS_DIR,
  SoapClient,
  type ApiOptions,
  type SoapOptions,
} from '@utils';
import path from 'path';

const COOKIES_DIR = path.join(ARTIFACTS_DIR, 'cookies');

// ---- Auth mode switch (FORM | SESSION) ----
type AuthMode = 'FORM' | 'SESSION';

export const test = baseTest.extend<Fixtures>({
  // Allow tests to optionally provide API client options via `test.use({ apiServiceOptions: { ... } })`
  apiServiceOptions: async ({}, use: (opts: ApiOptions) => Promise<void>) => {
    await use({});
  },

  // Allow tests to optionally provide SOAP client options via `test.use({ soapServiceOptions: { ... } })`
  soapServiceOptions: async ({}, use: (opts: SoapOptions) => Promise<void>) => {
    await use({});
  },

  // Allow tests to optionally provide Apollo client options via `test.use({ apolloClientOptions: { ... } })`
  apolloClientOptions: async (
    {},
    use: (opts: { uri?: string; headers?: Record<string, string> }) => Promise<void>,
  ) => {
    await use({});
  },

  // Provide ApiClient wrapper as a fixture that tests can use directly
  apiService: async (
    { apiServiceOptions }: { apiServiceOptions: ApiOptions },
    use: (client: ApiClient) => Promise<void>,
    testInfo: TestInfo,
  ) => {
    const baseURL = apiServiceOptions?.apiBaseURL || process.env.API_BASE_URL;
    const options: ApiOptions = {
      apiBaseURL: baseURL,
      apiEndPoint: apiServiceOptions?.apiEndPoint || '',
      extraHTTPHeaders: apiServiceOptions?.extraHTTPHeaders,
      headers: apiServiceOptions?.headers,
      clientCertificates: apiServiceOptions?.clientCertificates,
      log: apiServiceOptions?.log,
      retryCount: apiServiceOptions?.retryCount,
      retryDelayMs: apiServiceOptions?.retryDelayMs,
      polling: apiServiceOptions?.polling,
      pollingIntervalMs: apiServiceOptions?.pollingIntervalMs,
      pollingTimeoutMs: apiServiceOptions?.pollingTimeoutMs,
    };
    const client = new ApiClient(options, testInfo);
    await use(client);
    await client.dispose();
  },

  // Provide ApolloClient wrapper as a fixture that tests can use directly
  apolloClient: async (
    {
      apolloClientOptions,
    }: { apolloClientOptions: { uri?: string; headers?: Record<string, string> } },
    use: (client: ApolloClient) => Promise<void>,
  ) => {
    // Allow using a lightweight mock for BDD/CI runs by setting USE_MOCK_APOLLO=true
    const useMock = process.env.USE_MOCK_APOLLO === 'true';

    class MockApolloClient {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      private launches: Array<any>;
      private booked: Set<string>;

      constructor() {
        this.booked = new Set();
        // seed with deterministic launches
        this.launches = Array.from({ length: 5 }).map((_, i) => ({
          id: `L-${i + 1}`,
          site: `Site-${i + 1}`,
          mission: { name: `Mission ${i + 1}` },
          rocket: { name: `Rocket ${i + 1}` },
          isBooked: false,
        }));
      }

      async getLaunches(pageSize = 10) {
        return { launches: this.launches.slice(0, pageSize) };
      }

      async getLaunch(id: string) {
        return this.launches.find((l) => l.id === id) ?? null;
      }

      async bookTrips(launchIds: string[]) {
        const launches = launchIds.map((id) => {
          const l = this.launches.find((x) => x.id === id) ?? null;
          if (l) {
            l.isBooked = true;
            this.booked.add(id);
          }
          return l;
        });
        return { success: true, message: 'mocked', launches };
      }

      async cancelTrip(launchId: string) {
        const l = this.launches.find((x) => x.id === launchId) ?? null;
        if (l) {
          l.isBooked = false;
          this.booked.delete(launchId);
        }
        return { success: true, message: 'mocked', launches: [l] };
      }

      async login(email?: string) {
        return { id: 'user-mock-1', email: email ?? 'test@example.com', token: 'mock-token' };
      }

      async dispose() {
        // no-op
        return;
      }
    }

    if (useMock) {
      const client = new MockApolloClient() as unknown as ApolloClient;
      await use(client);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const disposeFn = (client as any).dispose;
      if (disposeFn) await disposeFn.call(client);
      return;
    }

    const uri =
      apolloClientOptions?.uri ||
      process.env.APOLLO_GRAPHQL_ENDPOINT ||
      'https://apollo-fullstack-tutorial.herokuapp.com/graphql';
    const client = new ApolloClient(uri, apolloClientOptions?.headers);
    await use(client);
    await client.dispose();
  },

  // Provide SoapClient wrapper as a fixture that tests can use directly
  soapService: async (
    { soapServiceOptions }: { soapServiceOptions: SoapOptions },
    use: (client: SoapClient) => Promise<void>,
    testInfo: TestInfo,
  ) => {
    const wsdlURL = soapServiceOptions?.url;
    const options: SoapOptions = {
      url: wsdlURL,
      headers: soapServiceOptions?.headers,
      soapAction: soapServiceOptions?.soapAction,
      body: soapServiceOptions?.body,
      responsePath: soapServiceOptions?.responsePath,
      log: soapServiceOptions?.log,
    };
    const client = new SoapClient(options, testInfo);
    await use(client);
    await client.dispose();
  },

  /**
   * SOAP test data fixture
   * - Loads from ./data/soap/*.ts (typed import)
   * - Available as `{ soapData }` in all tests
   */
  soapData: async ({}, use) => {
    await use({
      calculator: calculatorSoapData,
      countryInfo: countryInfoSoapData,
      numberConversion: numberConversionSoapData,
    });
  },

  /**
   * SOAP schemas fixture
   * - Available as `{ soapSchemas }` in all tests
   */
  soapSchemas: async ({}, use) => {
    await use({
      calculatorSchema: calculatorSchema,
      capitalCitySchema: capitalCitySchema,
      countryNameSchema: countryNameSchema,
      numberToWordsSchema: numberToWordsSchema,
      numberToDollarsSchema: numberToDollarsSchema,
    });
  },

  /**
   * API test data fixture
   * - Loads from ./data/api/*.ts (typed import)
   * - Available as `{ apiData }` in all tests
   */
  apiData: async ({}, use) => {
    await use({
      contacts: contactsData,
      users: usersData,
      profiles: profilesData,
    });
  },

  /**
   * API schemas fixture
   * - Available as `{ apiSchemas }` in all tests
   */
  apiSchemas: async ({}, use) => {
    await use({
      userSchema: userSchema,
      usersListSchema: usersListSchema,
      profileSchema: profileSchema,
      contactSchema: contactSchema,
      contactsListSchema: contactsListSchema,
      healthSchema: healthSchema,
    });
  },

  // Authenticated
  page: async ({ browser }, use) => {
    const AUTH_MODE = (process.env.AUTH_MODE?.toUpperCase() as AuthMode) || 'FORM';

    // SESSION — reuse saved storageState (cookies, localStorage)
    if (AUTH_MODE === 'SESSION') {
      const storageStatePath = path.resolve(COOKIES_DIR, `${process.env.USER_NAME}_cookies.json`);
      const context = await browser.newContext({ storageState: storageStatePath });
      const page = await context.newPage();
      await use(page);
      await page.close();
      await context.close();
    }

    // FORM (default) — regular fresh page
    if (AUTH_MODE === 'FORM') {
      const context = await browser.newContext();
      const page = await context.newPage();
      const loginPage = new LoginPage(page);
      await loginPage.navigation.goToLoginPage();
      await loginPage.login(process.env.USER_NAME!, process.env.USER_PASSWORD!);
      await use(page);
      await page.close();
      await context.close();
    }
  },

  // authedPage simply proxies to the `page` fixture so existing POs work
  authedPage: async ({ page }, use) => {
    await use(page);
  },

  // Page Objects built on the single authenticated page
  homePage: async ({ authedPage }, use) => {
    await use(new HomePage(authedPage));
  },

  inventoryPage: async ({ authedPage }, use) => {
    await use(new InventoryPage(authedPage));
  },

  cartPage: async ({ authedPage }, use) => {
    await use(new CartPage(authedPage));
  },

  checkoutPage: async ({ authedPage }, use) => {
    await use(new CheckoutPage(authedPage));
  },

  /**
   * Checkout test data fixture
   * - Loads from ./data/checkout.ts (typed import)
   * - Available as `{ checkoutData }` in all tests
   */
  checkoutData: async ({}, use) => {
    await use(checkoutData);
  },

  // Page objects as fixtures
  loginPage: async ({ page }: { page: Page }, use: (p: LoginPage) => Promise<void>) => {
    const login = new LoginPage(page);
    // Do not perform navigation or automatic login at fixture setup — tests can call these explicitly.
    await use(login);
  },
});

export const expect = baseExpect;
export const { Given, When, Then } = createBdd(test);
