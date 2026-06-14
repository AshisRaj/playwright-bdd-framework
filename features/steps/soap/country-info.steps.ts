import { When } from '@fixtures';

When('I call CountryInfo CapitalCity', async ({ soapService, soapData }) => {
  globalThis.__lastSoapResult = await soapService.call(soapData.countryInfo.capitalCity);
});

When('I call CountryInfo CountryName', async ({ soapService, soapData }) => {
  globalThis.__lastSoapResult = await soapService.call(soapData.countryInfo.countryName);
});
