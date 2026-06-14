Feature: Health API

  Scenario: Health check should return OK
    When I send GET request to "/health"
    Then the response status should be 200
    And the response JSON path "status" equals "OK"
    And the response schema "healthSchema" is valid
