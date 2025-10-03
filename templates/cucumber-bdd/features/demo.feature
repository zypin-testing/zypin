Feature: Search Demo
  As a web user
  I want to test search functionality
  So that I can verify the application works

  Scenario: Simple search
    Given I navigate to "https://zypin-testing.github.io/zypin-demo-website/"
    When I enter "webdriver" in "[name='q']"
    And I press Enter in "[name='q']"
    Then I should see the page title is "webdriver - Google Search"
