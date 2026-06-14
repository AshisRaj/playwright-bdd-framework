import { Then, When, expect } from '@fixtures';
import { validateSoapResponse } from '@utils';

When(
  'I validate SOAP schema {string} with value {string}',
  async ({ soapSchemas }, schemaName: string, value: string) => {
    // treat numeric-looking strings as numbers when possible
    let parsed: any = value;
    if (/^\d+$/.test(value)) parsed = Number(value);
    try {
      await validateSoapResponse((soapSchemas as any)[schemaName], parsed);
      // store success flag
      (globalThis as any).__lastValidationSucceeded = true;
    } catch (err) {
      (globalThis as any).__lastValidationSucceeded = false;
    }
  },
);

// Also handle numeric value passed as an integer placeholder
When(
  'I validate SOAP schema {string} with value {int}',
  async ({ soapSchemas }, schemaName: string, value: number) => {
    const parsed: any = value;
    try {
      await validateSoapResponse((soapSchemas as any)[schemaName], parsed);
      (globalThis as any).__lastValidationSucceeded = true;
    } catch (err) {
      (globalThis as any).__lastValidationSucceeded = false;
    }
  },
);

Then('the validation should fail', async ({}) => {
  expect((globalThis as any).__lastValidationSucceeded).toBe(false);
});
