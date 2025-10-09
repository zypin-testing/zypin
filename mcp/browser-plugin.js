import { chromium, firefox, webkit } from 'playwright';
import { z } from 'zod';

// --- Plugin State ---
let browser = null;
let page = null;

// --- Helper Functions ---
async function ensureBrowser(options) {
  if (!browser) {
    const browserType = { chromium, firefox, webkit }[options.browser || 'chromium'] || chromium;
    browser = await browserType.launch({ headless: !!options.headless });
    page = await browser.newPage();
    console.error(`Browser ${options.browser || 'chromium'} launched.`);
  }
  return { browser, page };
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    console.error('Browser closed.');
    return { status: 'closed' };
  }
  return { status: 'not_running' };
}

// --- Plugin Initializer ---
export async function initializeBrowserPlugin(server, cliOptions = {}) {
  
  // Define and register browser_execute tool
  server.tool(
    'browser_execute',
    'Execute JavaScript code in a browser context with access to Playwright browser and page objects. Automatically launches browser if not already running.',
    {
      script: z.string().describe('JavaScript code to execute. The function will have access to \'browser\' and \'page\' variables from Playwright.'),
    },
    async ({ script }) => {
      try {
        const { browser: b, page: p } = await ensureBrowser(cliOptions);
        // Use an async function constructor to execute the script
        const fn = new (Object.getPrototypeOf(async function(){}).constructor)('browser', 'page', script);
        const result = await fn(b, p);
        // Return the result, stringified if it's an object
        const resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        return {
          content: [{ type: 'text', text: resultText }]
        };
      } catch (error) {
        console.error('Error in browser_execute:', error);
        // Re-throw to let MCP handle it as a tool error
        throw new Error(`Execution failed: ${error.message}`);
      }
    }
  );

  // Define and register browser_close tool
  server.tool(
    'browser_close',
    'Close the active browser instance and clean up resources.',
    {},
    async () => {
      const result = await closeBrowser();
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }]
      };
    }
  );

  // --- Graceful Shutdown Handler ---
  process.on('SIGINT', async () => {
    console.error('\nGracefully shutting down MCP server and browser...');
    await closeBrowser();
    process.exit(0);
  });

  console.error('Browser Plugin initialized.');
}
