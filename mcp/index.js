import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { createProject, runTests } from '../cli/actions.js';
import { listAllTemplates } from './template-helper.js';
import { addBrowserTools } from './browser.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

export async function startAgent(options) {
  let browserCleanup = null;
  const server = new Server({
    name: 'zypin',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {},
      resources: {}
    }
  });

  // ==================== TOOLS ====================
  const tools = [
    {
      name: 'zypin_new_project',
      description: 'Creates a new Zypin test project from a template.',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: { 
            type: 'string',
            description: 'Name of the project to create'
          },
          cwd: {
            type: 'string',
            description: 'Absolute path to the directory where the project should be created'
          },
          template: { 
            type: 'string',
            description: 'Template to use: playwright-basic, selenium-basic, or cucumber-bdd'
          }
        },
        required: ['projectName', 'cwd']
      },
      handler: async ({ projectName, cwd, template }) => {
        // Validate absolute path
        if (!path.isAbsolute(cwd)) {
          throw new Error(`cwd must be an absolute path. Received: ${cwd}`);
        }
        
        const projectPath = await createProject(projectName, { 
          template: template || 'playwright-basic',
          cwd 
        });
        return { success: true, message: `Project ${projectName} created at ${projectPath}` };
      }
    },
    {
      name: 'zypin_run_tests',
      description: 'Runs tests in the current or specified project directory.',
      inputSchema: {
        type: 'object',
        properties: {
          filePattern: { 
            type: 'string',
            description: 'Test file pattern to run (e.g., "tests/**/*.test.js")'
          },
          cwd: { 
            type: 'string',
            description: 'Absolute path to the project directory to run tests in'
          }
        },
        required: ['filePattern', 'cwd']
      },
      handler: async ({ filePattern, cwd }) => {
        // Validate absolute path
        if (!path.isAbsolute(cwd)) {
          throw new Error(`cwd must be an absolute path. Received: ${cwd}`);
        }
        
        await runTests(filePattern, { cwd });
        return { success: true, message: 'Tests completed.' };
      }
    },
    {
      name: 'zypin_list_templates',
      description: 'Lists all available project templates and their metadata.',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      handler: async () => {
        const templates = listAllTemplates();
        return { templates };
      }
    }
  ];

  // ==================== BROWSER TOOLS ====================
  // Add browser automation tools from playwright
  try {
    browserCleanup = await addBrowserTools(tools, options);
  } catch (error) {
    console.error('Warning: Failed to load browser tools:', error.message);
    console.error('Continuing without browser automation capabilities...');
  }

  // ==================== RESOURCES ====================
  // Auto-discover resources from all templates
  const getResources = () => {
    const templates = listAllTemplates();
    const resources = [];

    templates.forEach(template => {
      try {
        const pkgPath = path.join(TEMPLATES_DIR, template.id, 'package.json');
        const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const mcpResources = pkgJson.zypin_template?.mcp?.resources || {};

        Object.entries(mcpResources).forEach(([key, file]) => {
          resources.push({
            uri: `zypin://template/${template.id}/${key}`,
            name: `${template.name} - ${key}`,
            description: `${key} file from ${template.name} template`,
            mimeType: 'text/plain'
          });
        });
      } catch (error) {
        console.error(`Error loading resources for template ${template.id}:`, error.message);
      }
    });

    return resources;
  };

  const readResource = async (uri) => {
    const match = uri.match(/^zypin:\/\/template\/([^\/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid resource URI: ${uri}`);
    }

    const [, templateId, resourceKey] = match;
    
    try {
      const pkgPath = path.join(TEMPLATES_DIR, templateId, 'package.json');
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const mcpResources = pkgJson.zypin_template?.mcp?.resources || {};
      
      const filePath = mcpResources[resourceKey];
      if (!filePath) {
        throw new Error(`Resource '${resourceKey}' not found in template '${templateId}'`);
      }

      const fullPath = path.join(TEMPLATES_DIR, templateId, filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: content
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to read resource: ${error.message}`);
    }
  };

  // ==================== HANDLERS ====================
  
  // Tool handlers
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const tool = tools.find(t => t.name === toolName);

    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    try {
      const result = await tool.handler(request.params.arguments || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    };
  });

  // Resource handlers
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: getResources()
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return await readResource(request.params.uri);
  });

  // ==================== LIFECYCLE ====================
  
  // Handle graceful shutdown
  const shutdown = async () => {
    console.error('\nShutting down Zypin Agent...');
    if (browserCleanup) {
      console.error('Cleaning up browser resources...');
      await browserCleanup.cleanup();
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.error('Zypin MCP Server started');
  console.error(`Capabilities: Tools (${tools.length}) ✓ | Resources ✓`);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Server will stay alive until client disconnects or SIGINT/SIGTERM is received
}
