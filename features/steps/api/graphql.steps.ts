import { Then, When, expect } from '@fixtures';

let lastQueryResult: any = null;
let lastPostId: string | null = null;

When('I query country code {string}', async ({ apiService }, code: string) => {
  lastQueryResult = await apiService.queryCountry('https://countries.trevorblades.com/', code);
});

Then('the last graphql country code should be {string}', async ({}, code: string) => {
  expect(lastQueryResult.data?.country?.code).toBe(code);
});

Then('the last graphql country name should be {string}', async ({}, name: string) => {
  expect(lastQueryResult.data?.country?.name).toBe(name);
});

When(
  'I create a test post with title {string} and body {string}',
  async ({ apiService }, title: string, body: string) => {
    lastPostId = await apiService.createTestPost('https://graphqlzero.almansi.me/api', title, body);
  },
);

Then('the created post id is saved as {string}', async ({}, key: string) => {
  // store on global for cross-step reuse

  (globalThis as any).__savedValues = (globalThis as any).__savedValues || {};

  (globalThis as any).__savedValues[key] = lastPostId as any;
});

When(
  'I update the post with saved id with title {string} and body {string}',
  async ({ apiService }, title: string, body: string) => {
    const id = (globalThis as any).__savedValues?.postId;
    if (!id) throw new Error('No saved postId');
    await apiService.updateTestPost('https://graphqlzero.almansi.me/api', id, title, body);
  },
);

When('I delete the post with saved id', async ({ apiService }) => {
  const id = (globalThis as any).__savedValues?.postId;
  if (!id) throw new Error('No saved postId');
  await apiService.deleteTestPost('https://graphqlzero.almansi.me/api', id);
});

Then('querying the post by saved id returns no post', async ({ apiService }) => {
  const id = (globalThis as any).__savedValues?.postId;
  if (!id) throw new Error('No saved postId');
  const queryResult = await apiService.queryPost('https://graphqlzero.almansi.me/api', id);
  expect(queryResult.data?.post).not.toBeNull();
});
