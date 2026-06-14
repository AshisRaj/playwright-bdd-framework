Feature: Sauce Demo Cart

  Scenario: Navigate to cart
    Given I am on Inventory page
    When I add item "sauce-labs-backpack" to cart
    And I click shopping cart link
    Then I should see cart title "Your Cart"
