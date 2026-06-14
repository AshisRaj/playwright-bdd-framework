import { Given, Then, When, expect } from '@fixtures';
import { validateApiResponse } from '@utils';
import get from 'lodash/get';
import { DataTable } from 'playwright-bdd';

// shared state between BDD steps within a single scenario
let lastResponse: any = null;
const savedValues: Record<string, any> = {};

Given('the API base path {string}', async ({}, basePath: string) => {
  void basePath;
});

function resolvePath(path: string) {
  return path.replace(/{(\w+)}/g, (_, key) => String(savedValues[key] ?? `{${key}}`));
}

When('I send GET request to {string}', async ({ apiService }, path: string) => {
  lastResponse = await apiService.get(resolvePath(path));
});

When(
  'I send GET request to {string} with options:',
  async ({ apiService }, path: string, opts: string) => {
    let options: any = {};
    try {
      options = JSON.parse(opts);
    } catch (e) {
      // ignore parse errors — if not JSON, leave as empty
    }
    lastResponse = await apiService.get(resolvePath(path), options);
  },
);

When('I send DELETE request to {string}', async ({ apiService }, path: string) => {
  lastResponse = await apiService.delete(resolvePath(path));
});

When(
  'I send POST request to {string} with body:',
  async ({ apiService }, path: string, body: string) => {
    let payload: unknown = null;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      payload = body;
    }
    lastResponse = await apiService.post(resolvePath(path), payload);
  },
);

When(
  'I send POST request to {string} with data table:',
  async ({ apiService }, path: string, dataTable: DataTable) => {
    const payload: Record<string, any> = dataTable.hashes()[0] || {};
    payload.userId = Number(payload.userId);
    lastResponse = await apiService.post(resolvePath(path), payload);
  },
);

When(
  'I send POST request to {string} with {string}:',
  async ({ apiService, apiData }, path: string, contactsData: string) => {
    const payload = get(apiData, contactsData);
    lastResponse = await apiService.post(resolvePath(path), payload);
  },
);

When(
  'I send GraphQL request to {string} with query:',
  async ({ apiService }, endpoint: string, query: string) => {
    lastResponse = await apiService.graphql(endpoint, query);
  },
);

Then('the response status should be {int}', async ({}, status: number) => {
  expect(lastResponse).toBeDefined();
  expect(lastResponse.status()).toBe(status);
});

Then(
  'the response JSON path {string} equals {string}',
  async ({}, path: string, expected: string) => {
    expect(lastResponse).toBeDefined();
    const body = await lastResponse.json();
    const value = get(body, path);
    expect(String(value)).toBe(expected);
  },
);

Then('the response JSON contains {string}', async ({}, fragment: string) => {
  expect(lastResponse).toBeDefined();
  const bodyText = JSON.stringify(await lastResponse.json());
  expect(bodyText).toContain(fragment);
});

Then(
  'the response JSON path {string} is saved as {string}',
  async ({}, path: string, saveKey: string) => {
    expect(lastResponse).toBeDefined();
    const body = await lastResponse.json();
    const value = get(body, path);
    savedValues[saveKey] = value;
  },
);

Given('the saved value {string} exists', async ({}, key: string) => {
  expect(savedValues[key]).toBeDefined();
});

Then('the response schema {string} is valid', async ({ apiSchemas }, schemaName: string) => {
  expect(lastResponse).toBeDefined();
  const body = await lastResponse.json();
  const schema = (apiSchemas as any)[schemaName];
  await validateApiResponse(schema, body);
});
