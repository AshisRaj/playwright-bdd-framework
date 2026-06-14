import { When, Then, expect } from '@fixtures';
import { validateSoapResponse } from '@utils';

When('I call calculator operation {string}', async ({ soapService, soapData }: any, op: string) => {
  const opts = (soapData as any).calculator[op];
  // store on globalThis so common SOAP steps can assert on it
  globalThis.__lastSoapResult = await soapService.call(opts);
});

Then('the calculator parsed result should equal {int}', async ({}: any, expected: number) => {
  expect(globalThis.__lastSoapResult).toBeDefined();
  expect(globalThis.__lastSoapResult!.status).toBe(200);
  expect(globalThis.__lastSoapResult!.parsed).toBe(expected);
});

Then('the calculator response schema is valid', async ({ soapSchemas }: any) => {
  expect(globalThis.__lastSoapResult).toBeDefined();
  await validateSoapResponse(soapSchemas.calculatorSchema, globalThis.__lastSoapResult!.parsed);
});
