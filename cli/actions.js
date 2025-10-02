import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function createProject(projectName, options) {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const templatePath = path.resolve(__dirname, '../templates', options.template);
  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    // Use console.error and exit for CLI-specific validation
    console.error(chalk.red(`Error: Directory '${projectName}' already exists.`));
    process.exit(1);
  }

  if (!fs.existsSync(templatePath)) {
    console.error(chalk.red(`Error: Template '${options.template}' not found.`));
    process.exit(1);
  }

  console.log(`Creating new project '${projectName}' using template '${options.template}'...`);
  fs.copySync(templatePath, projectPath);
  console.log(chalk.green(`Project created successfully at ${projectPath}`));
  console.log(`
Next steps:
  cd ${projectName}
  npm install
  zypin test "tests/**/*.js"
`);
  return projectPath; // Return the path
}

export async function runTests(filePattern, options = {}) {
  const cwd = options.cwd || process.cwd();
  console.log(`Running tests for pattern '${filePattern}' in ${cwd}...`);
  const configPath = path.resolve(cwd, 'zypin.config.js');

  if (!fs.existsSync(configPath)) {
    throw new Error(`zypin.config.js not found in directory: ${cwd}`);
  }

  const config = (await import(configPath)).default;
  const runnerName = config.runner;

  if (!runnerName) {
    throw new Error('No runner specified in zypin.config.js');
  }

  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const runnerPath = path.resolve(__dirname, '../runners', `${runnerName}.js`);
  if (!fs.existsSync(runnerPath)) {
    throw new Error(`Runner '${runnerName}' not found.`);
  }

  const runner = await import(runnerPath);
  await runner.run(filePattern, config, { cwd });
  console.log(chalk.green('Test run completed successfully.'));
}
