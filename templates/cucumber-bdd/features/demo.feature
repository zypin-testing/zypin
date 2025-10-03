Feature: Zypin BDD Framework Demo
  Showcase the comprehensive testing capabilities of Zypin
  Including navigation, forms, interactions, and verifications

  Scenario: Interactive Form Testing
    Given I navigate to "https://zypin-testing.github.io/zypin-demo-website/"
    And I wait for page to load completely
    When I scroll to "[data-testid='name-input']"
    And I enter "John Doe" in "[data-testid='name-input']"
    And I enter "john@example.com" in "[data-testid='email-input']"
    And I check "[data-testid='checkbox-playwright']"
    And I check "[data-testid='checkbox-cucumber']"
    And I select radio button "[data-testid='radio-intermediate']"
    And I select "Vietnam" from dropdown "[data-testid='country-select']"
    Then I should see "[data-testid='checkbox-playwright']" is checked
    And I should see "[data-testid='radio-intermediate']" is checked
    And I should see "Vietnam" selected in dropdown "[data-testid='country-select']"

  Scenario: Click Actions and Dynamic Content
    Given I navigate to "https://zypin-testing.github.io/zypin-demo-website/"
    When I scroll to "[data-testid='click-button']"
    And I click on "[data-testid='click-button']"
    And I wait for 1 seconds
    Then I should see element "#clickCount"
    When I scroll to "[data-testid='toggle-dynamic']"
    And I click on "[data-testid='toggle-dynamic']"
    Then I should see element "#liveCounter"

  Scenario: Hover and Dropdown Interactions
    Given I navigate to "https://zypin-testing.github.io/zypin-demo-website/"
    When I scroll to "[data-testid='hover-card']"
    And I hover over "[data-testid='hover-card']"
    Then I should see element ".hover-content"
    When I scroll to "[data-testid='dropdown-menu']"
    And I click on "#dropdownButton"
    And I wait for 1 seconds
    Then I should see element "[data-testid='menu-option-1']"
    And I should see element "[data-testid='menu-option-2']"
    And I should see element "[data-testid='menu-option-3']"

  Scenario: Cookie Management and Storage
    Given I navigate to "https://zypin-testing.github.io/zypin-demo-website/"
    When I set cookie "auth_token" with value "demo-session-123"
    And I set cookie "username" with value "testuser"
    And I set local storage "theme" with value "dark"
    And I set session storage "session_id" with value "abc123"
    Then I should see element "#header"
    When I refresh the page
    Then I should see the page title is "Zypin Testing Demo"

  Scenario: Navigation and Page Verification
    Given I navigate to "https://zypin-testing.github.io/zypin-demo-website/"
    Then I should see the page title is "Zypin Testing Demo"
    And I should see current URL is "https://zypin-testing.github.io/zypin-demo-website/"
    And I should see element "#header"
    And I should see "Zypin Testing Demo" in ".logo"
    When I click on link containing text "Get started"
    Then I should see current URL contains "#installation"
    And I should see element "[data-testid='installation-heading']"

  Scenario: Scrolling and Element States
    Given I navigate to "https://zypin-testing.github.io/zypin-demo-website/"
    When I scroll to bottom
    And I wait for 1 seconds
    Then I should see element "[data-testid='footer']"
    When I scroll to "[data-testid='scroll-target']"
    Then I should see "[data-testid='scroll-target']" is visible
    When I scroll to top
    Then I should see element "#header"
