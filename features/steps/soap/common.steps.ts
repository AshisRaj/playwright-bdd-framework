import { Given, Then, When, expect } from '@fixtures';
import { validateSoapResponse } from '@utils';

declare global {
  // allow storing soap result across step modules

  var __lastSoapResult: { status: number; rawBody: string; parsed?: any } | null | undefined;
}

if (globalThis.__lastSoapResult === undefined) globalThis.__lastSoapResult = null;

Given('the SOAP endpoint {string}', async ({}, url: string) => {
  // Placeholder to make feature files readable. Actual URL is passed when calling soap client.
  void url;
});

When('I call SOAP with options:', async ({ soapService }: any, table: string) => {
  // Expect `table` to be a JSON string or raw XML body in the step text; try parse as JSON for options
  let opts: any;
  try {
    opts = JSON.parse(table);
  } catch (e) {
    // If it's not JSON, treat the table as body
    opts = { body: table };
  }
  // store on globalThis so other step modules can access it
  globalThis.__lastSoapResult = await soapService.call(opts);
});

When(
  'I call SOAP endpoint {string} with body:',
  async ({ soapService }: any, url: string, body: string) => {
    globalThis.__lastSoapResult = await soapService.call({ url, body });
  },
);

Then('the SOAP response status should be {int}', async ({}, expected: number) => {
  expect(globalThis.__lastSoapResult).toBeDefined();
  expect(globalThis.__lastSoapResult!.status).toBe(expected);
});

Then(
  'the SOAP parsed path {string} equals {string}',
  async ({}, path: string, expected: string) => {
    expect(globalThis.__lastSoapResult).toBeDefined();
    const parts = path.split('.');
    let value: any = globalThis.__lastSoapResult!.parsed;
    for (const p of parts) {
      if (value == null) break;
      value = value[p];
    }
    expect(String(value)).toBe(expected);
  },
);

Then('the SOAP raw body contains {string}', async ({}, fragment: string) => {
  expect(globalThis.__lastSoapResult).toBeDefined();
  expect(globalThis.__lastSoapResult!.rawBody).toContain(fragment);
});

Then('the parsed result is a non-empty string', async ({}) => {
  expect(globalThis.__lastSoapResult).toBeDefined();
  const parsed = globalThis.__lastSoapResult!.parsed as string;
  expect(typeof parsed).toBe('string');
  expect(parsed.length).toBeGreaterThan(0);
});

Then('the SOAP schema {string} is valid', async ({ soapSchemas }, schemaName: string) => {
  expect(globalThis.__lastSoapResult).toBeDefined();
  const schema = (soapSchemas as any)[schemaName];
  // Validate the extracted/parsed value (not the full raw XML body)
  await validateSoapResponse(schema, globalThis.__lastSoapResult!.parsed);
});
