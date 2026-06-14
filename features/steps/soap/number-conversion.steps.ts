import { When } from '@fixtures';

When('I call NumberConversion NumberToWords', async ({ soapService, soapData }) => {
  globalThis.__lastSoapResult = await soapService.call(soapData.numberConversion.numberToWords);
});

When('I call NumberConversion NumberToDollars', async ({ soapService, soapData }) => {
  globalThis.__lastSoapResult = await soapService.call(soapData.numberConversion.numberToDollars);
});
