import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function scaffoldLogic(templateName, options = {}) {
  const templatesDir = path.resolve(__dirname, '../../templates');
  const templatePath = path.join(templatesDir, templateName);
  const templateJsonPath = path.join(templatePath, '.template.json');
  const scaffoldPath = path.join(templatePath, 'scaffold');

  // Check if template exists
  if (!fs.existsSync(templateJsonPath)) {
    throw new Error(`Template '${templateName}' not found`);
  }

  // Check if scaffold folder exists
  if (!fs.existsSync(scaffoldPath)) {
    throw new Error(`Template '${templateName}' is missing scaffold folder`);
  }

  // Determine target directory
  const targetDir = options.destinationPath || path.join(process.cwd(), templateName);

  // Check if target directory already exists
  if (fs.existsSync(targetDir)) {
    throw new Error(`Directory '${path.basename(targetDir)}' already exists`);
  }

  // Copy scaffold contents to target directory
  fs.copySync(scaffoldPath, targetDir);
  
  const templateInfo = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));

  return {
    targetDir,
    templateInfo,
  };
}

export async function run(templateName) {
  if (!templateName) {
    // Show available templates instead of error
    console.log(chalk.yellow('No template specified. Available templates:\n'));
    const { run: listRun } = await import('./list.js');
    await listRun();
    return;
  }

  try {
    const { targetDir, templateInfo } = await scaffoldLogic(templateName);

    console.log(chalk.blue(`Scaffolding '${templateInfo.name}' template...`));
    console.log(chalk.gray(templateInfo.description));
    console.log(chalk.green(`✓ Template '${templateName}' scaffolded successfully!`));
    console.log(`
${chalk.bold('Template added:')} ${targetDir}
${chalk.bold('Next steps:')}
  ${chalk.cyan(`npm test ${templateName}/`)}              # Run template tests (auto-detects test files)
`);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    if (error.message.includes('not found')) {
      console.log('Run "npm run list" to see available templates');
    }
    process.exit(1);
  }
}
