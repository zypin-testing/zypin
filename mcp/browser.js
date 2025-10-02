import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Add browser tools from playwright-mcp via internal MCP client
 * @param {Array} zypinTools - Array of zypin tools to append browser tools to
 * @param {Object} options - Browser options (headed, browser name)
 * @returns {Promise<Object>} Cleanup object with client and server references
 */
export async function addBrowserTools(zypinTools, options) {
  try {
    console.error('Initializing browser tools...');

    // 1. Create playwright MCP server
    const { createConnection } = require('playwright/lib/mcp/index');
    const playwrightServer = await createConnection({
      browser: {
        browserName: options.browser || 'chromium',
        launchOptions: {
          headless: !options.headed,
          channel: options.browser
        }
      }
    });

    // 2. Setup in-memory transport (server <-> client communication)
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
    await playwrightServer.connect(serverTransport);

    // 3. Create internal MCP client to communicate with playwright server
    const playwrightClient = new Client({
      name: 'zypin-internal',
      version: '1.0.0'
    });
    await playwrightClient.connect(clientTransport);

    // 4. Get all browser tools from playwright
    const { tools: playwrightTools } = await playwrightClient.listTools();
    console.error(`✓ Found ${playwrightTools.length} browser tools from playwright`);

    // 5. Wrap each playwright tool and add to zypin tools
    playwrightTools.forEach(tool => {
      zypinTools.push({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        handler: async (args) => {
          // Forward tool call to playwright via internal client
          const result = await playwrightClient.callTool({
            name: tool.name,
            arguments: args
          });
          
          // Return result in zypin format
          return {
            success: !result.isError,
            content: result.content,
            isError: result.isError
          };
        }
      });
    });

    console.error('✓ Browser tools integrated');

    // Return cleanup object for graceful shutdown
    return {
      client: playwrightClient,
      server: playwrightServer,
      async cleanup() {
        await playwrightClient.close().catch(() => {});
      }
    };
  } catch (error) {
    console.error('Failed to initialize browser tools:', error.message);
    throw error;
  }
}
