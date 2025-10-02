export default {
  runner: 'selenium',
  
  // Browser: 'chrome' | 'firefox' | 'edge' | 'safari'
  browser: 'chrome',
  
  // Run browser in headless mode
  headless: false,
  
  // Additional browser arguments
  browserArgs: [
    // '--start-maximized',
    // '--disable-notifications',
    // '--no-sandbox',  // For CI/CD
  ],
  
  // Timeouts in milliseconds
  implicitWait: 10000,       // Element wait
  pageLoadTimeout: 30000,    // Page load
  scriptTimeout: 30000       // Script execution
};
