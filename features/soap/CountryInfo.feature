Feature: Country Info SOAP

  Scenario: CapitalCity returns a non-empty string
    When I call CountryInfo CapitalCity
    Then the SOAP response status should be 200
    And the parsed result is a non-empty string
    And the SOAP schema "capitalCitySchema" is valid

  Scenario: CountryName returns a non-empty string
    When I call CountryInfo CountryName
    Then the SOAP response status should be 200
    And the parsed result is a non-empty string
    And the SOAP schema "countryNameSchema" is valid
