Feature: Hello World Demo
  A simple demonstration of Zypin BDD testing

  Scenario: Hello World Test
    Given I navigate to "https://zypin-testing.github.io/zypin-demo-website/"
    Then I should see the page title is "Zypin Testing Demo"
