import { setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import { createSeleniumDriver } from '../../../runners/selenium.js';

// Get config passed from cucumber runner via environment
const config = JSON.parse(process.env.ZYPIN_CONFIG || '{}');
const cucumberTimeout = config.cucumberTimeout || 30000;
setDefaultTimeout(cucumberTimeout);

class CustomWorld {
  constructor({ attach }) {
    this.driver = null;
    this.attach = attach;
  }

  async initializeDriver() {
    // Get config passed from cucumber runner via environment
    const config = JSON.parse(process.env.ZYPIN_CONFIG || '{}');
    this.driver = await createSeleniumDriver(config);
  }

  async cleanupDriver() {
    if (this.driver) {
      await this.driver.quit();
    }
  }
}

setWorldConstructor(CustomWorld);
