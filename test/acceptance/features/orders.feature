@OrderPlacement
Feature: Request Orders
  Allow customers to place orders

  Scenario: 
    Given an existing item in the menu
    And a customer wants to place an order
    When the customer checks the order out
    And the payment is approved
    And the order preparation is advanced
    And the customer picks up his order
    Then the order is marked complete
