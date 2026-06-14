Feature: Mocked Health API - Advanced

  Scenario: should succeed with retry on failure
    When I send GET request to "/mock-health-retry" with options:
      """
      { "retryCount": 2, "retryDelayMs": 200 }
      """
    Then the response status should be 200
    And the response schema "healthSchema" is valid

  Scenario: should poll until healthy
    When I send GET request to "/mock-health-poll" with options:
      """
      { "polling": true, "pollingIntervalMs": 100, "pollingTimeoutMs": 2000 }
      """
    Then the response status should be 200
    And the response schema "healthSchema" is valid

  Scenario: should delay between retries and respect timeout
    When I send GET request to "/mock-health-delay" with options:
      """
      { "retryCount": 3, "retryDelayMs": 500 }
      """
    Then the response status should be 200
    And the response schema "healthSchema" is valid
