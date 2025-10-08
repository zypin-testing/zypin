#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('zypin')
  .description('A simplified, all-in-one testing framework.')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new testing project in current directory')
  .action(async () => {
    const { run } = await import('./commands/init.js');
    await run();
  });

program
  .command('scaffold [template-name]')
  .description('Add a testing template to current project')
  .action(async (templateName) => {
    const { run } = await import('./commands/scaffold.js');
    await run(templateName);
  });

program
  .command('list')
  .description('Show available templates')
  .action(async () => {
    const { run } = await import('./commands/list.js');
    await run();
  });

program
  .command('test <file-pattern>')
  .description('Run tests using the configured runner')
  .allowUnknownOption()
  .allowExcessArguments()
  .action(async (filePattern, options, command) => {
    // Collect all unknown options as CLI args
    const cliArgs = command.args.slice(1); // Skip the file-pattern
    const { run } = await import('./commands/test.js');
    await run(filePattern, { cliArgs });
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

program.parse(process.argv);
