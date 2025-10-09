import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Import the refactored logic functions
import { getTemplatesLogic } from '../cli/commands/list.js';
import { scaffoldLogic } from '../cli/commands/scaffold.js';
import { initializeBrowserPlugin } from './browser-plugin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Server Setup ---

const server = new McpServer({
  name: 'zypin',
  version: '1.0.0',
});

// --- Tool Registration ---

// list_templates
server.tool(
  'list_templates',
  'Lists all available testing templates and their resources.',
  {}, // No input
  async () => {
    const rawTemplates = await getTemplatesLogic();
    const templates = rawTemplates.map(template => {
      const resources = template?.mcp?.resources || {};
      const availableResources = Object.keys(resources).map(key => ({
        resourceName: key,
        name: resources[key].name,
        description: resources[key].description || ''
      }));
      return {
        templateName: template.id,
        name: template.name,
        description: template.description,
        availableResources: availableResources
      };
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(templates, null, 2) }]
    };
  }
);

// create_project
server.tool(
  'create_project',
  'Creates a new testing project from a specified template.',
  {
    projectName: z.string().describe('The name of the directory for the new project.'),
    templateName: z.string().describe('The name of the template to use.'),
  },
  async ({ projectName, templateName }) => {
    const destinationPath = path.resolve(process.cwd(), projectName);
    const { targetDir } = await scaffoldLogic(templateName, { destinationPath });
    const output = {
      success: true,
      message: `Project '${projectName}' created successfully from template '${templateName}'.`,
      path: targetDir,
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(output, null, 2) }]
    };
  }
);

// get_template_resource
server.tool(
  'get_template_resource',
  'Retrieves the content of a specific resource file from a template.',
  {
    templateName: z.string().describe('The name of the template (from list_templates).'),
    resourceName: z.string().describe('The name of the resource to retrieve (from availableResources).'),
  },
  async ({ templateName, resourceName }) => {
    const templatesDir = path.resolve(__dirname, '../templates');
    const templatePath = path.join(templatesDir, templateName);
    const templateJsonPath = path.join(templatePath, '.template.json');

    if (!fs.existsSync(templateJsonPath)) {
      throw new Error(`Template '${templateName}' not found.`);
    }

    const templateInfo = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));
    const resource = templateInfo?.mcp?.resources?.[resourceName];

    if (!resource) {
      throw new Error(`Resource '${resourceName}' not found in template '${templateName}'.`);
    }

    const resourcePath = path.resolve(templatePath, resource.file);

    if (!fs.existsSync(resourcePath)) {
      throw new Error(`Resource file not found at path: ${resource.file}`);
    }

    const content = fs.readFileSync(resourcePath, 'utf-8');
    const output = {
      name: resource.name,
      description: resource.description,
      content: content,
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(output, null, 2) }]
    };
  }
);

// --- User Tool Loading ---

async function loadUserTools(serverInstance) {
  const userToolsPath = path.resolve(process.cwd(), 'zypin.mcp.js');
  if (!fs.existsSync(userToolsPath)) {
    return; // No user tools file found
  }

  try {
    console.error('Loading user-defined tools from zypin.mcp.js...');
    const userModule = await import(`${userToolsPath}?v=${Date.now()}`);
    
    if (Array.isArray(userModule.default)) {
      userModule.default.forEach(tool => {
        // The user-defined tool should follow the same structure
        serverInstance.tool(tool.name, tool.description, tool.inputSchema, tool.execute);
      });
      console.error(`Found and registered ${userModule.default.length} user-defined tool(s).`);
    } else {
      console.error('Warning: zypin.mcp.js was found, but it does not have a default export that is an array.');
    }
  } catch (error) {
    console.error('Error loading user-defined tools from zypin.mcp.js:', error);
  }
}

// --- Main Server Execution ---

export async function main(cliOptions = {}) {
  // Initialize plugins
  await initializeBrowserPlugin(server, cliOptions);

  // Load user tools and register them
  await loadUserTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Zypin MCP Server running on stdio.`);
}
