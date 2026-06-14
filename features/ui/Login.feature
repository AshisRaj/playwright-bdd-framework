Feature: Sauce Demo Login

  Scenario: Login with default credentials
    Given I go to login page
    When I login with default credentials
    Then I should see text "Products"
