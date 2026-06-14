Feature: Users API

  Scenario: Create user
    When I send POST request to "/users" with body:
      """
      {
        "data": { "name": "Ashis Raj" }
      }
      """
    Then the response status should be 201
    And the response JSON path "id" is saved as "userId"
    And the response JSON path "data.name" equals "Ashis Raj"
    And the response schema "userSchema" is valid

  Scenario: Get all users
    When I send GET request to "/users"
    Then the response status should be 200
    And the response JSON path "length" is saved as "usersListLength"
    And the response schema "usersListSchema" is valid

  Scenario: Get user by ID
    Given the saved value "userId" exists
    When I send GET request to "/users/{userId}"
    Then the response status should be 200
    And the response schema "userSchema" is valid

  Scenario: Delete user
    Given the saved value "userId" exists
    When I send DELETE request to "/users/{userId}"
    Then the response status should be 200
