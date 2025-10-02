Feature: Google Search
  As a web user
  I want to search on Google
  So that I can find information

  Scenario: Simple search
    Given I navigate to "https://www.google.com/ncr"
    When I enter "webdriver" in "[name='q']"
    And I press Enter in "[name='q']"
    Then I should see the page title is "webdriver - Google Search"
