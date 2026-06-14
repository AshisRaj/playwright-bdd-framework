Feature: Number Conversion SOAP

  Scenario: NumberToWords returns a non-empty string
    When I call NumberConversion NumberToWords
    Then the SOAP response status should be 200
    And the parsed result is a non-empty string
    And the SOAP schema "numberToWordsSchema" is valid

  Scenario: NumberToDollars returns a non-empty string
    When I call NumberConversion NumberToDollars
    Then the SOAP response status should be 200
    And the parsed result is a non-empty string
    And the SOAP schema "numberToDollarsSchema" is valid
