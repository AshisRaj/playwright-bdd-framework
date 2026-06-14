Feature: Profiles API

  Scenario: Create profile
    When I send POST request to "/profiles" with body:
      """
      {
        "userId": 111,
        "designation": "Principal SDET",
        "experience": 15
      }
      """
    Then the response status should be 201
    And the response schema "profileSchema" is valid

  Scenario: Get profile by userId
    When I send GET request to "/profiles/111"
    Then the response status should be 200
    And the response JSON path "designation" equals "Principal SDET"
    And the response schema "profileSchema" is valid
