#!/usr/bin/env node
import { Command } from 'commander';
import { createProject, runTests, updateZypin } from './actions.js';

const program = new Command();

program
  .name('zypin')
  .description('A simplified, all-in-one testing framework.')
  .version('1.0.0');

program
  .command('init <project-name>')
  .description('Create a new testing project from a template')
  .option('-t, --template <template-name>', 'The template to use', 'playwright-basic')
  .action(createProject);

program
  .command('test <file-pattern>')
  .description('Run tests using the configured runner')
  .allowUnknownOption()
  .allowExcessArguments()
  .action((filePattern, options, command) => {
    // Collect all unknown options as CLI args
    const cliArgs = command.args.slice(1); // Skip the file-pattern
    runTests(filePattern, { cliArgs });
  });

program
  .command('mcp')
  .description('Start the unified Zypin agent for AI interaction.')
  .option('--headed', 'Run the browser in headed mode')
  .option('--browser <browser-name>', 'Browser to use (chromium, firefox, webkit)', 'chromium')
  .action(async (options) => {
    const { startAgent } = await import('../mcp/index.js');
    await startAgent(options);
  });

program
  .command('update')
  .description('Update zypin to the latest version from GitHub')
  .action(updateZypin);

program.parse(process.argv);
