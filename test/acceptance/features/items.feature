@Catalogue
Feature: Items
  Allows collaborators items

  Scenario: 
    Given The need to add a new item to the menu
    When a colaborator makes a create item request
    Then the item is added to the menu
    And will be available on the get item endpoint