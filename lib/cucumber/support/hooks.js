import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';

BeforeAll(async function() {
  console.log('Starting Cucumber test suite...');
});

Before(async function() {
  await this.initializeDriver();
});

After(async function(scenario) {
  if (scenario.result.status === 'FAILED') {
    try {
      const screenshot = await this.driver.takeScreenshot();
      const buffer = Buffer.from(screenshot, 'base64');
      this.attach(buffer, 'image/png');
    } catch (error) {
      console.error('Failed to take screenshot on failure', error);
    }
  }
  await this.cleanupDriver();
});

AfterAll(async function() {
  console.log('Cucumber test suite finished.');
});
