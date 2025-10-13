import { chromium, firefox, webkit } from 'playwright';
import { z } from 'zod';
import { setupRecording } from '../lib/recorder.js';

// --- Plugin State ---
let browser = null;
let page = null;

// --- Recording State ---
let recordingState = {
  isRecording: false,
  actions: [],
  startTime: null,
  startUrl: null
};

// --- Helper Functions ---
async function ensureBrowser(options) {
  // Check if browser references exist but are actually closed
  if (browser) {
    try {
      // Quick health check - this will throw if browser is closed
      await page.evaluate(() => true);
    } catch (error) {
      // Browser was closed improperly - require proper cleanup
      throw new Error('Browser has been closed improperly. Please call browser_close to cleanup state, then call browser_execute to relaunch.');
    }
  }
  
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
    try {
      await browser.close();
    } catch (error) {
      // Browser already closed manually, ignore error
      console.error('Browser was already closed.');
    }
    browser = null;
    page = null;
    // Reset recording state on cleanup
    recordingState.isRecording = false;
    recordingState.actions = [];
    console.error('Browser closed and state cleaned up.');
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

  // Define and register browser_start_recording tool
  server.tool(
    'browser_start_recording',
    'Start recording user interactions in the browser. Browser must be open first.',
    {
      url: z.string().optional().describe('Optional URL to navigate to before recording starts')
    },
    async ({ url }) => {
      // Validation: Check browser is open
      if (!browser || !page) {
        throw new Error('Browser is not open. Call browser_execute to open browser first.');
      }
      
      // Validation: Check not already recording
      if (recordingState.isRecording) {
        throw new Error('Already recording. Call browser_stop_recording first.');
      }
      
      // Initialize recording state
      recordingState = {
        isRecording: true,
        actions: [],
        startTime: Date.now(),
        startUrl: url || page.url()
      };
      
      // Navigate if URL provided
      if (url) {
        await page.goto(url);
      }
      
      // Expose function for browser to call
      try {
        await page.exposeFunction('__recordAction', (action) => {
          if (recordingState.isRecording) {
            recordingState.actions.push({ ...action, timestamp: Date.now() });
          }
        });
      } catch (e) {
        // Already exposed, ignore
      }
      
      // Initial injection
      await setupRecording(page);
      
      // Handle navigation/reload - auto re-inject
      page.on('framenavigated', async (frame) => {
        if (recordingState.isRecording && frame === page.mainFrame()) {
          // Record navigation action
          recordingState.actions.push({
            type: 'navigate',
            url: frame.url(),
            description: `Navigated to ${frame.url()}`,
            timestamp: Date.now()
          });
          // Re-inject recording script
          try {
            await setupRecording(page);
          } catch (error) {
            console.error('Error re-injecting recorder on navigation:', error);
          }
        }
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'recording',
            url: page.url(),
            message: 'Recording started. User can now interact with the page.'
          }, null, 2)
        }]
      };
    }
  );

  // Define and register browser_stop_recording tool
  server.tool(
    'browser_stop_recording',
    'Stop recording and return all captured user actions',
    {},
    async () => {
      // Validation: Check if recording
      if (!recordingState.isRecording) {
        throw new Error('Not currently recording. Call browser_start_recording first.');
      }
      
      recordingState.isRecording = false;
      
      // Cleanup: remove recording indicator
      try {
        await page.evaluate(() => {
          const indicator = document.getElementById('__recording_indicator');
          if (indicator) indicator.remove();
        });
      } catch (e) {
        // Page might be closed, ignore
      }
      
      // Remove navigation listener
      page.removeAllListeners('framenavigated');
      
      // Format results for Agent
      const result = {
        url: recordingState.startUrl,
        duration: Math.round((Date.now() - recordingState.startTime) / 1000),
        actionCount: recordingState.actions.length,
        actions: recordingState.actions.map((action, idx) => ({
          step: idx + 1,
          ...action
        }))
      };
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
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
