Feature: Apollo GraphQL operations

  Scenario: Apollo - Read all launches
    When I fetch launches with limit 10
    Then the launches list should have at least 1 item

  Scenario: Apollo - Read launch by id
    When I fetch launches with limit 1
    And I save the first launch id
    And I fetch launch by saved id
    Then the launch id should equal saved id
    And the launch mission name should be defined

  Scenario: Apollo - Book trip for a launch
    When I fetch launches with limit 1
    And I save the first launch id
    And I login with email "test@example.com"
    And I book trip for saved launch
    Then the booking should be successful

  Scenario: Apollo - User login mutation
    When I login with email "test@example.com"
    Then the login result should contain id and token and email "test@example.com"

  Scenario: Apollo - Cancel booked trip
    When I fetch launches with limit 1
    And I save the first launch id
    And I login with email "test@example.com"
    And I book trip for saved launch
    And I cancel booked trip for saved launch
    Then the cancellation should be successful
