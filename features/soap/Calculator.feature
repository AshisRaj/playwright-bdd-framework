Feature: SOAP Calculator operations

  Scenario: Calculator Add
    When I call calculator operation "add"
    Then the SOAP response status should be 200
    And the calculator parsed result should equal 5
    And the calculator response schema is valid

  Scenario: Calculator Subtract
    When I call calculator operation "subtract"
    Then the SOAP response status should be 200
    And the calculator parsed result should equal 6
    And the calculator response schema is valid

  Scenario: Calculator Multiply
    When I call calculator operation "multiply"
    Then the SOAP response status should be 200
    And the calculator parsed result should equal 42
    And the calculator response schema is valid

  Scenario: Calculator Divide
    When I call calculator operation "divide"
    Then the SOAP response status should be 200
    And the calculator parsed result should equal 5
    And the calculator response schema is valid
