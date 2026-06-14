Feature: SOAP Validation Negative

  Scenario: validation should fail for empty CapitalCity
    When I validate SOAP schema "capitalCitySchema" with value ""
    Then the validation should fail

  Scenario: validation should fail for numeric country name
    When I validate SOAP schema "countryNameSchema" with value 123
    Then the validation should fail

  Scenario: validation should fail for NumberToWords numeric response
    When I validate SOAP schema "numberToWordsSchema" with value 100
    Then the validation should fail

  Scenario: validation should fail for NumberToDollars missing dollar keyword
    When I validate SOAP schema "numberToDollarsSchema" with value "100"
    Then the validation should fail
