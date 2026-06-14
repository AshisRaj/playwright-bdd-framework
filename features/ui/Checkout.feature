Feature: Sauce Demo Checkout

  Scenario Outline: Checks out successfully
    Given I am on Inventory page
    When I add item "sauce-labs-backpack" to cart
    And I click shopping cart link
    And I click on Checkout button
    And I fill checkout form with "<firstName>" "<lastName>" "<postalCode>"
    And I continue to overview

    Examples:
      | firstName | lastName | postalCode |
      | John      | Doe      | 90210      |

  Scenario: Shows error for missing fields
    Given I am on Inventory page
    When I add item "sauce-labs-backpack" to cart
    And I click shopping cart link
    And I click on Checkout button
    And I fill checkout form with "" "" ""
    And I click Continue button
    Then I should see an error message
