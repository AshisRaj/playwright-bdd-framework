# This is a sample feature file for testing a Contacts API.
# It includes scenarios for
# creating a contact with inline data,
# creating a contact with data from an external file,
# creating a contact with data from a data table,
# retrieving all contacts,
# retrieving contacts by userId, and
# deleting a contact.
Feature: Contacts API

  # This scenario demonstrates using inline JSON data directly in the step definition
  Scenario: Create contact with inline data
    When I send POST request to "/contacts" with body:
      """
      {
        "name": "New Contact",
        "email": "new@example.com",
        "userId": 1
      }
      """
    Then the response status should be 201
    And the response JSON path "id" is saved as "contactId"
    And the response JSON path "userId" is saved as "contactUserId"
    And the response schema "contactSchema" is valid

  # This scenario demonstrates using data as Data Table directly in the step definition
  Scenario: Create contact with data table
    When I send POST request to "/contacts" with data table:
      | name        | email           | userId |
      | New Contact | new@example.com | 1      |
    Then the response status should be 201
    And the response JSON path "id" is saved as "contactId"
    And the response JSON path "userId" is saved as "contactUserId"
    And the response schema "contactSchema" is valid

  # This scenario demonstrates using test data from an external file (test-data/api/contacts.ts)
  # via the "apiData" fixture
  Scenario: Create contact with data from apiData
    When I send POST request to "/contacts" with "contacts.newContact":
    Then the response status should be 201
    And the response JSON path "id" is saved as "contactId"
    And the response JSON path "userId" is saved as "contactUserId"
    And the response schema "contactSchema" is valid

  # This scenario demonstrates Test Data via Scenario Outline with Data Table
  Scenario Outline: Create contact with scenario outline data
    When I send POST request to "/contacts" with data table:
      | name   | email   | userId   |
      | <name> | <email> | <userId> |
    Then the response status should be 201
    And the response JSON path "id" is saved as "contactId"
    And the response JSON path "userId" is saved as "contactUserId"
    And the response schema "contactSchema" is valid

    Examples:
      | name        | email           | userId |
      | New Contact | new@example.com | 1      |

  # This scenario demonstrates retrieving all contacts and validating the response
  Scenario: Get All contacts
    When I send GET request to "/contacts"
    Then the response status should be 200
    And the response schema "contactsListSchema" is valid

  # This scenario demonstrates retrieving contacts by userId and validating the response
  Scenario: Get contacts by userId
    Given the saved value "contactUserId" exists
    When I send GET request to "/contacts?userId={contactUserId}"
    Then the response status should be 200
    And the response JSON path "0.userId" equals "1"
    And the response schema "contactsListSchema" is valid

  # This scenario demonstrates deleting a contact by its saved id and validating the response
  Scenario: Delete contact
    Given the saved value "contactId" exists
    When I send DELETE request to "/contacts/{contactId}"
    Then the response status should be 200
