Feature: Sauce Demo Inventory

  Scenario: Add items to cart
    Given I am on Inventory page
    When I add item "sauce-labs-backpack" to cart
    Then the cart badge should show "1"

  Scenario: Remove items from cart
    Given I am on Inventory page
    When I add item "sauce-labs-backpack" to cart
    And I remove item "sauce-labs-backpack" from cart
    Then the cart should be empty
