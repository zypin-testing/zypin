import { Given, When, Then } from '@cucumber/cucumber';
import { By, Key, until } from 'selenium-webdriver';

/**
 * Zypin Step Definitions - Comprehensive Test Steps
 * Complete coverage for modern web application testing
 */

// ============================================================================
// NAVIGATION
// ============================================================================

Given('I navigate to {string}', async function (url) {
  console.log(`🌐 Navigating to: ${url}`);
  await this.driver.get(url);
});

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

When('I set cookie {string} with value {string}', async function (name, value) {
  console.log(`🍪 Setting cookie: ${name}`);
  await this.driver.manage().addCookie({ name, value });
});

When('I delete cookie {string}', async function (name) {
  console.log(`🍪 Deleting cookie: ${name}`);
  await this.driver.manage().deleteCookie(name);
});

When('I clear all cookies', async function () {
  console.log(`🍪 Clearing all cookies`);
  await this.driver.manage().deleteAllCookies();
});

// ============================================================================
// LOCAL & SESSION STORAGE
// ============================================================================

When('I set local storage {string} with value {string}', async function (key, value) {
  console.log(`💾 Setting local storage: ${key}`);
  await this.driver.executeScript(`window.localStorage.setItem('${key}', '${value}');`);
});

When('I set session storage {string} with value {string}', async function (key, value) {
  console.log(`💾 Setting session storage: ${key}`);
  await this.driver.executeScript(`window.sessionStorage.setItem('${key}', '${value}');`);
});

When('I clear local storage', async function () {
  console.log(`💾 Clearing local storage`);
  await this.driver.executeScript('window.localStorage.clear();');
});

When('I clear session storage', async function () {
  console.log(`💾 Clearing session storage`);
  await this.driver.executeScript('window.sessionStorage.clear();');
});

// ============================================================================
// JAVASCRIPT EXECUTION
// ============================================================================

When('I execute JavaScript {string}', async function (script) {
  console.log(`⚡ Executing JavaScript: ${script.substring(0, 50)}...`);
  await this.driver.executeScript(script);
});

Then('console should not contain errors', async function () {
  console.log(`🔍 Checking console for errors`);
  const logs = await this.driver.manage().logs().get('browser');
  const errors = logs.filter(entry => entry.level.name === 'SEVERE');
  if (errors.length > 0) {
    const errorMessages = errors.map(e => e.message).join('\n');
    throw new Error(`Console contains ${errors.length} error(s):\n${errorMessages}`);
  }
});

// ============================================================================
// CLICK ACTIONS
// ============================================================================

When('I click on {string}', async function (selector) {
  console.log(`🖱️  Clicking on: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await element.click();
});

When('I click on link with text {string}', async function (linkText) {
  console.log(`🖱️  Clicking on link with text: ${linkText}`);
  const element = await this.driver.wait(until.elementLocated(By.linkText(linkText)), this.timeout);
  await element.click();
});

When('I click on link containing text {string}', async function (partialLinkText) {
  console.log(`🖱️  Clicking on link containing text: ${partialLinkText}`);
  const element = await this.driver.wait(until.elementLocated(By.partialLinkText(partialLinkText)), this.timeout);
  await element.click();
});

When('I click on {int}st {string}', async function (index, selector) {
  console.log(`🖱️  Clicking on ${index}st element: ${selector}`);
  const elements = await this.driver.wait(until.elementsLocated(By.css(selector)), this.timeout);
  if (elements.length < index) {
    throw new Error(`Only found ${elements.length} elements matching ${selector}, but tried to click ${index}st`);
  }
  await elements[index - 1].click();
});

When('I click on {int}nd {string}', async function (index, selector) {
  console.log(`🖱️  Clicking on ${index}nd element: ${selector}`);
  const elements = await this.driver.wait(until.elementsLocated(By.css(selector)), this.timeout);
  if (elements.length < index) {
    throw new Error(`Only found ${elements.length} elements matching ${selector}, but tried to click ${index}nd`);
  }
  await elements[index - 1].click();
});

When('I click on {int}rd {string}', async function (index, selector) {
  console.log(`🖱️  Clicking on ${index}rd element: ${selector}`);
  const elements = await this.driver.wait(until.elementsLocated(By.css(selector)), this.timeout);
  if (elements.length < index) {
    throw new Error(`Only found ${elements.length} elements matching ${selector}, but tried to click ${index}rd`);
  }
  await elements[index - 1].click();
});

When('I click on {int}th {string}', async function (index, selector) {
  console.log(`🖱️  Clicking on ${index}th element: ${selector}`);
  const elements = await this.driver.wait(until.elementsLocated(By.css(selector)), this.timeout);
  if (elements.length < index) {
    throw new Error(`Only found ${elements.length} elements matching ${selector}, but tried to click ${index}th`);
  }
  await elements[index - 1].click();
});

// ============================================================================
// TEXT INPUT ACTIONS
// ============================================================================

When('I enter {string} in {string}', async function (text, selector) {
  console.log(`⌨️  Entering "${text}" in: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await element.clear();
  await element.sendKeys(text);
});

When('I clear {string}', async function (selector) {
  console.log(`🧹 Clearing field: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await element.clear();
});

When('I press Enter in {string}', async function (selector) {
  console.log(`⌨️  Pressing Enter in: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await element.sendKeys(Key.RETURN);
});

// ============================================================================
// KEYBOARD ACTIONS
// ============================================================================

When('I press {string} key', async function (keyName) {
  console.log(`⌨️  Pressing key: ${keyName}`);
  const keyMap = {
    'Tab': Key.TAB,
    'Enter': Key.RETURN,
    'Escape': Key.ESCAPE,
    'Space': Key.SPACE,
    'Backspace': Key.BACK_SPACE,
    'Delete': Key.DELETE,
    'ArrowUp': Key.ARROW_UP,
    'ArrowDown': Key.ARROW_DOWN,
    'ArrowLeft': Key.ARROW_LEFT,
    'ArrowRight': Key.ARROW_RIGHT,
    'Home': Key.HOME,
    'End': Key.END,
    'PageUp': Key.PAGE_UP,
    'PageDown': Key.PAGE_DOWN
  };
  
  const key = keyMap[keyName];
  if (!key) {
    throw new Error(`Unknown key: ${keyName}. Available keys: ${Object.keys(keyMap).join(', ')}`);
  }
  
  const body = await this.driver.findElement(By.css('body'));
  await body.sendKeys(key);
});

When('I press {string} key in {string}', async function (keyName, selector) {
  console.log(`⌨️  Pressing ${keyName} in: ${selector}`);
  const keyMap = {
    'Tab': Key.TAB,
    'Enter': Key.RETURN,
    'Escape': Key.ESCAPE,
    'Space': Key.SPACE,
    'Backspace': Key.BACK_SPACE,
    'Delete': Key.DELETE,
    'ArrowUp': Key.ARROW_UP,
    'ArrowDown': Key.ARROW_DOWN,
    'ArrowLeft': Key.ARROW_LEFT,
    'ArrowRight': Key.ARROW_RIGHT
  };
  
  const key = keyMap[keyName];
  if (!key) {
    throw new Error(`Unknown key: ${keyName}. Available keys: ${Object.keys(keyMap).join(', ')}`);
  }
  
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await element.sendKeys(key);
});

// ============================================================================
// FORM ACTIONS - Dropdown/Select
// ============================================================================

When('I select {string} from dropdown {string}', async function (optionText, selector) {
  console.log(`📋 Selecting "${optionText}" from dropdown: ${selector}`);
  const selectElement = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const options = await selectElement.findElements(By.css('option'));
  
  let optionFound = false;
  for (const option of options) {
    const text = await option.getText();
    if (text === optionText) {
      await option.click();
      optionFound = true;
      break;
    }
  }
  
  if (!optionFound) {
    throw new Error(`Option "${optionText}" not found in dropdown ${selector}`);
  }
});

When('I select option with value {string} from dropdown {string}', async function (value, selector) {
  console.log(`📋 Selecting option with value "${value}" from dropdown: ${selector}`);
  const selectElement = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const option = await selectElement.findElement(By.css(`option[value="${value}"]`));
  await option.click();
});

// ============================================================================
// FORM ACTIONS - Checkbox & Radio
// ============================================================================

When('I check {string}', async function (selector) {
  console.log(`☑️  Checking: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const isChecked = await element.isSelected();
  if (!isChecked) {
    await element.click();
  }
});

When('I uncheck {string}', async function (selector) {
  console.log(`☐  Unchecking: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const isChecked = await element.isSelected();
  if (isChecked) {
    await element.click();
  }
});

When('I select radio button {string}', async function (selector) {
  console.log(`🔘 Selecting radio button: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await element.click();
});

// ============================================================================
// FORM ACTIONS - Submit
// ============================================================================

When('I submit the form {string}', async function (selector) {
  console.log(`📤 Submitting form: ${selector}`);
  const form = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await form.submit();
});

// ============================================================================
// FILE UPLOAD
// ============================================================================

When('I upload file {string} to {string}', async function (filePath, selector) {
  console.log(`📎 Uploading file "${filePath}" to: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await element.sendKeys(filePath);
});

// ============================================================================
// HOVER & SCROLL ACTIONS
// ============================================================================

When('I hover over {string}', async function (selector) {
  console.log(`👆 Hovering over: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const actions = this.driver.actions({ bridge: true });
  await actions.move({ origin: element }).perform();
});

When('I scroll to {string}', async function (selector) {
  console.log(`📜 Scrolling to: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await this.driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', element);
  // Wait a bit for smooth scroll to complete
  await this.driver.sleep(500);
});

When('I scroll to top', async function () {
  console.log(`📜 Scrolling to top`);
  await this.driver.executeScript('window.scrollTo({top: 0, behavior: "smooth"});');
  await this.driver.sleep(500);
});

When('I scroll to bottom', async function () {
  console.log(`📜 Scrolling to bottom`);
  await this.driver.executeScript('window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"});');
  await this.driver.sleep(500);
});

// ============================================================================
// DRAG & DROP
// ============================================================================

When('I drag {string} to {string}', async function (sourceSelector, targetSelector) {
  console.log(`🎯 Dragging ${sourceSelector} to ${targetSelector}`);
  const source = await this.driver.wait(until.elementLocated(By.css(sourceSelector)), this.timeout);
  const target = await this.driver.wait(until.elementLocated(By.css(targetSelector)), this.timeout);
  const actions = this.driver.actions({ bridge: true });
  await actions.dragAndDrop(source, target).perform();
});

// ============================================================================
// WAIT ACTIONS
// ============================================================================

When('I wait for {string} to be visible', async function (selector) {
  console.log(`⏳ Waiting for element to be visible: ${selector}`);
  await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const element = await this.driver.findElement(By.css(selector));
  await this.driver.wait(until.elementIsVisible(element), this.timeout);
});

When('I wait for {int} seconds', async function (seconds) {
  console.log(`⏳ Waiting for ${seconds} seconds`);
  await this.driver.sleep(seconds * 1000);
});

When('I wait for {string} to be enabled', async function (selector) {
  console.log(`⏳ Waiting for element to be enabled: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await this.driver.wait(until.elementIsEnabled(element), this.timeout);
});

When('I wait for page to load completely', async function () {
  console.log(`⏳ Waiting for page to load completely`);
  await this.driver.wait(async () => {
    const readyState = await this.driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, this.timeout);
  // Additional wait for any pending AJAX/fetch requests (optional but helpful for SPAs)
  await this.driver.sleep(500);
});

// ============================================================================
// BROWSER ACTIONS
// ============================================================================

When('I go back', async function () {
  console.log(`◀️  Going back`);
  await this.driver.navigate().back();
});

When('I go forward', async function () {
  console.log(`▶️  Going forward`);
  await this.driver.navigate().forward();
});

When('I refresh the page', async function () {
  console.log(`🔄 Refreshing page`);
  await this.driver.navigate().refresh();
});

// ============================================================================
// ALERT/DIALOG ACTIONS
// ============================================================================

When('I accept the alert', async function () {
  console.log(`✅ Accepting alert`);
  await this.driver.wait(until.alertIsPresent(), this.timeout);
  const alert = await this.driver.switchTo().alert();
  await alert.accept();
});

When('I dismiss the alert', async function () {
  console.log(`❌ Dismissing alert`);
  await this.driver.wait(until.alertIsPresent(), this.timeout);
  const alert = await this.driver.switchTo().alert();
  await alert.dismiss();
});

When('I enter {string} in alert', async function (text) {
  console.log(`⌨️  Entering "${text}" in alert`);
  await this.driver.wait(until.alertIsPresent(), this.timeout);
  const alert = await this.driver.switchTo().alert();
  await alert.sendKeys(text);
  await alert.accept();
});

// ============================================================================
// IFRAME & WINDOW ACTIONS
// ============================================================================

When('I switch to iframe {string}', async function (selector) {
  console.log(`🖼️  Switching to iframe: ${selector}`);
  const iframe = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  await this.driver.switchTo().frame(iframe);
});

When('I switch to main content', async function () {
  console.log(`🖼️  Switching to main content`);
  await this.driver.switchTo().defaultContent();
});

When('I switch to window {int}', async function (windowIndex) {
  console.log(`🪟 Switching to window ${windowIndex}`);
  const handles = await this.driver.getAllWindowHandles();
  if (handles.length < windowIndex) {
    throw new Error(`Only ${handles.length} windows open, cannot switch to window ${windowIndex}`);
  }
  await this.driver.switchTo().window(handles[windowIndex - 1]);
});

When('I switch to new window', async function () {
  console.log(`🪟 Switching to new window`);
  const handles = await this.driver.getAllWindowHandles();
  await this.driver.switchTo().window(handles[handles.length - 1]);
});

When('I close current window', async function () {
  console.log(`🪟 Closing current window`);
  await this.driver.close();
  const handles = await this.driver.getAllWindowHandles();
  if (handles.length > 0) {
    await this.driver.switchTo().window(handles[0]);
  }
});

// ============================================================================
// VERIFICATION - Text Content
// ============================================================================

Then('I should see {string} in {string}', async function (text, selector) {
  console.log(`👀 Verifying text "${text}" in: ${selector}`);
  try {
    const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
    const elementText = await element.getText();
    if (!elementText.includes(text)) {
      throw new Error(`Expected to see "${text}" in ${selector}, but found: "${elementText}"`);
    }
  } catch (error) {
    if (error.message.includes('Expected to see')) {
      throw error;
    }
    throw new Error(`Element ${selector} not found within ${this.timeout}ms timeout. ${error.message}`);
  }
});

Then('I should see exact text {string} in {string}', async function (text, selector) {
  console.log(`👀 Verifying exact text "${text}" in: ${selector}`);
  try {
    const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
    const elementText = await element.getText();
    if (elementText !== text) {
      throw new Error(`Expected exact text "${text}" in ${selector}, but found: "${elementText}"`);
    }
  } catch (error) {
    if (error.message.includes('Expected exact text')) {
      throw error;
    }
    throw new Error(`Element ${selector} not found within ${this.timeout}ms timeout. ${error.message}`);
  }
});

Then('I should not see {string} in {string}', async function (text, selector) {
  console.log(`👀 Verifying text "${text}" is NOT in: ${selector}`);
  try {
    const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
    const elementText = await element.getText();
    if (elementText.includes(text)) {
      throw new Error(`Expected NOT to see "${text}" in ${selector}, but found: "${elementText}"`);
    }
  } catch (error) {
    if (error.message.includes('Expected NOT to see')) {
      throw error;
    }
    throw new Error(`Element ${selector} not found within ${this.timeout}ms timeout. ${error.message}`);
  }
});

// ============================================================================
// VERIFICATION - Element Existence
// ============================================================================

Then('I should see element {string}', async function (selector) {
  console.log(`👀 Verifying element exists: ${selector}`);
  try {
    await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  } catch (error) {
    throw new Error(`Element ${selector} not found within ${this.timeout}ms timeout. ${error.message}`);
  }
});

Then('I should not see element {string}', async function (selector) {
  console.log(`👀 Verifying element does NOT exist: ${selector}`);
  try {
    await this.driver.wait(until.elementLocated(By.css(selector)), 1000);
    throw new Error(`Expected element ${selector} to NOT exist, but it was found`);
  } catch (error) {
    if (error.message.includes('Expected element')) {
      throw error;
    }
    // Element not found - this is what we want
    console.log(`✅ Element ${selector} correctly not found`);
  }
});

Then('I should see {int} elements {string}', async function (count, selector) {
  console.log(`👀 Verifying ${count} elements: ${selector}`);
  const elements = await this.driver.findElements(By.css(selector));
  if (elements.length !== count) {
    throw new Error(`Expected ${count} elements matching ${selector}, but found ${elements.length}`);
  }
});

Then('I should see at least {int} elements {string}', async function (minCount, selector) {
  console.log(`👀 Verifying at least ${minCount} elements: ${selector}`);
  const elements = await this.driver.findElements(By.css(selector));
  if (elements.length < minCount) {
    throw new Error(`Expected at least ${minCount} elements matching ${selector}, but found ${elements.length}`);
  }
});

// ============================================================================
// VERIFICATION - Element States
// ============================================================================

Then('I should see {string} is visible', async function (selector) {
  console.log(`👀 Verifying element is visible: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const isDisplayed = await element.isDisplayed();
  if (!isDisplayed) {
    throw new Error(`Element ${selector} exists but is not visible`);
  }
});

Then('I should see {string} is hidden', async function (selector) {
  console.log(`👀 Verifying element is hidden: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const isDisplayed = await element.isDisplayed();
  if (isDisplayed) {
    throw new Error(`Element ${selector} is visible but expected to be hidden`);
  }
});

Then('I should see {string} is enabled', async function (selector) {
  console.log(`👀 Verifying element is enabled: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const isEnabled = await element.isEnabled();
  if (!isEnabled) {
    throw new Error(`Element ${selector} is disabled but expected to be enabled`);
  }
});

Then('I should see {string} is disabled', async function (selector) {
  console.log(`👀 Verifying element is disabled: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const isEnabled = await element.isEnabled();
  if (isEnabled) {
    throw new Error(`Element ${selector} is enabled but expected to be disabled`);
  }
});

Then('I should see {string} is checked', async function (selector) {
  console.log(`👀 Verifying checkbox/radio is checked: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const isChecked = await element.isSelected();
  if (!isChecked) {
    throw new Error(`Element ${selector} is not checked but expected to be checked`);
  }
});

Then('I should see {string} is not checked', async function (selector) {
  console.log(`👀 Verifying checkbox/radio is not checked: ${selector}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const isChecked = await element.isSelected();
  if (isChecked) {
    throw new Error(`Element ${selector} is checked but expected to be not checked`);
  }
});

// ============================================================================
// VERIFICATION - Dropdown/Select
// ============================================================================

Then('I should see {string} selected in dropdown {string}', async function (expectedText, selector) {
  console.log(`👀 Verifying "${expectedText}" is selected in dropdown: ${selector}`);
  const selectElement = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const selectedOption = await selectElement.findElement(By.css('option:checked'));
  const selectedText = await selectedOption.getText();
  if (selectedText !== expectedText) {
    throw new Error(`Expected "${expectedText}" to be selected in ${selector}, but found: "${selectedText}"`);
  }
});

// ============================================================================
// VERIFICATION - Attributes & Classes
// ============================================================================

Then('I should see {string} has attribute {string} with value {string}', async function (selector, attribute, expectedValue) {
  console.log(`👀 Verifying ${selector} has ${attribute}="${expectedValue}"`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const actualValue = await element.getAttribute(attribute);
  if (actualValue !== expectedValue) {
    throw new Error(`Expected ${selector} to have ${attribute}="${expectedValue}", but found: "${actualValue}"`);
  }
});

Then('I should see {string} has class {string}', async function (selector, className) {
  console.log(`👀 Verifying ${selector} has class: ${className}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const classAttr = await element.getAttribute('class');
  const classes = classAttr ? classAttr.split(' ') : [];
  if (!classes.includes(className)) {
    throw new Error(`Expected ${selector} to have class "${className}", but found classes: ${classAttr}`);
  }
});

Then('I should see {string} does not have class {string}', async function (selector, className) {
  console.log(`👀 Verifying ${selector} does not have class: ${className}`);
  const element = await this.driver.wait(until.elementLocated(By.css(selector)), this.timeout);
  const classAttr = await element.getAttribute('class');
  const classes = classAttr ? classAttr.split(' ') : [];
  if (classes.includes(className)) {
    throw new Error(`Expected ${selector} to NOT have class "${className}", but it was found`);
  }
});

// ============================================================================
// VERIFICATION - Page Title & URL
// ============================================================================

Then('I should see the page title contains {string}', async function (expectedTitle) {
  console.log(`📄 Verifying page title contains: ${expectedTitle}`);
  await this.driver.wait(until.titleContains(expectedTitle), this.timeout);
  const actualTitle = await this.driver.getTitle();
  console.log(`📄 Actual page title: ${actualTitle}`);
});

Then('I should see the page title is {string}', async function (expectedTitle) {
  console.log(`📄 Verifying page title is: ${expectedTitle}`);
  await this.driver.wait(until.titleIs(expectedTitle), this.timeout);
});

Then('I should see current URL is {string}', async function (expectedUrl) {
  console.log(`🔗 Verifying current URL is: ${expectedUrl}`);
  await this.driver.wait(until.urlIs(expectedUrl), this.timeout);
});

Then('I should see current URL contains {string}', async function (urlPart) {
  console.log(`🔗 Verifying current URL contains: ${urlPart}`);
  await this.driver.wait(until.urlContains(urlPart), this.timeout);
});

// ============================================================================
// VERIFICATION - Links
// ============================================================================

Then('I should see link with text {string}', async function (linkText) {
  console.log(`👀 Verifying link with text exists: ${linkText}`);
  await this.driver.wait(until.elementLocated(By.linkText(linkText)), this.timeout);
});

Then('I should see link containing text {string}', async function (partialLinkText) {
  console.log(`👀 Verifying link containing text exists: ${partialLinkText}`);
  await this.driver.wait(until.elementLocated(By.partialLinkText(partialLinkText)), this.timeout);
});

// ============================================================================
// VERIFICATION - Alert
// ============================================================================

Then('I should see alert with text {string}', async function (expectedText) {
  console.log(`👀 Verifying alert text: ${expectedText}`);
  await this.driver.wait(until.alertIsPresent(), this.timeout);
  const alert = await this.driver.switchTo().alert();
  const alertText = await alert.getText();
  if (alertText !== expectedText) {
    throw new Error(`Expected alert text "${expectedText}", but found: "${alertText}"`);
  }
  // Don't accept/dismiss - let the user do it in the next step
});
