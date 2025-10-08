import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function run(templateName) {
  if (!templateName) {
    // Show available templates instead of error
    console.log(chalk.yellow('No template specified. Available templates:\n'));
    const { run: listRun } = await import('./list.js');
    await listRun();
    return;
  }
  
  const currentDir = process.cwd();
  const templatesDir = path.resolve(__dirname, '../../templates');
  const templatePath = path.join(templatesDir, templateName);
  const templateJsonPath = path.join(templatePath, '.template.json');
  const scaffoldPath = path.join(templatePath, 'scaffold');
  
  // Check if template exists
  if (!fs.existsSync(templateJsonPath)) {
    console.error(chalk.red(`Error: Template '${templateName}' not found`));
    console.log('Run "npm run list" to see available templates');
    process.exit(1);
  }
  
  // Check if scaffold folder exists
  if (!fs.existsSync(scaffoldPath)) {
    console.error(chalk.red(`Error: Template '${templateName}' is missing scaffold folder`));
    process.exit(1);
  }
  
  // Read template metadata
  const templateInfo = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));
  const targetDir = path.join(currentDir, templateName);
  
  // Check if target directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`Error: Directory '${templateName}' already exists`));
    process.exit(1);
  }
  
  console.log(chalk.blue(`Scaffolding '${templateInfo.name}' template...`));
  console.log(chalk.gray(templateInfo.description));
  
  // Copy scaffold contents to target directory
  fs.copySync(scaffoldPath, targetDir);
  
  console.log(chalk.green(`✓ Template '${templateName}' scaffolded successfully!`));
  console.log(`
${chalk.bold('Template added:')} ${targetDir}
${chalk.bold('Next steps:')}
  ${chalk.cyan(`npm test ${templateName}/`)}              # Run template tests (auto-detects test files)
`);
}
