import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function getTemplatesLogic() {
  const templatesDir = path.resolve(__dirname, '../../templates');

  if (!fs.existsSync(templatesDir)) {
    throw new Error('Templates directory not found');
  }

  const templateFolders = fs.readdirSync(templatesDir)
    .filter(folder => {
      const templateJsonPath = path.join(templatesDir, folder, '.template.json');
      return fs.existsSync(templateJsonPath);
    });

  if (templateFolders.length === 0) {
    return [];
  }

  return templateFolders.map(folder => {
    try {
      const templateJsonPath = path.join(templatesDir, folder, '.template.json');
      const templateInfo = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));
      return {
        id: folder,
        ...templateInfo
      };
    } catch (error) {
      // Return a partial object indicating an error for this template
      return {
        id: folder,
        error: 'Invalid template configuration',
        details: error.message,
      };
    }
  });
}

export async function run() {
  try {
    const templates = await getTemplatesLogic();

    if (templates.length === 0) {
      console.log(chalk.yellow('No templates found'));
      return;
    }

    console.log(chalk.bold('Available Templates:\n'));

    templates.forEach(template => {
      if (template.error) {
        console.log(`${chalk.red(template.id)} - ${template.error}`);
      } else {
        console.log(`${chalk.cyan.bold(template.id)}`);
        console.log(`  ${chalk.bold('Name:')} ${template.name}`);
        console.log(`  ${chalk.bold('Type:')} ${template.type}`);
        console.log(`  ${chalk.bold('Description:')} ${template.description}`);
        console.log(`  ${chalk.bold('Tags:')} ${template.tags.join(', ')}`);
        console.log('');
      }
    });

    console.log(chalk.gray('Usage: npm run scaffold <template-name>'));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
