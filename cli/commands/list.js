import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function run() {
  const templatesDir = path.resolve(__dirname, '../../templates');
  
  if (!fs.existsSync(templatesDir)) {
    console.error(chalk.red('Error: Templates directory not found'));
    process.exit(1);
  }
  
  console.log(chalk.bold('Available Templates:\n'));
  
  const templateFolders = fs.readdirSync(templatesDir)
    .filter(folder => {
      const templateJsonPath = path.join(templatesDir, folder, '.template.json');
      return fs.existsSync(templateJsonPath);
    });
  
  if (templateFolders.length === 0) {
    console.log(chalk.yellow('No templates found'));
    return;
  }
  
  templateFolders.forEach(folder => {
    try {
      const templateJsonPath = path.join(templatesDir, folder, '.template.json');
      const templateInfo = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));
      
      console.log(`${chalk.cyan.bold(folder)}`);
      console.log(`  ${chalk.bold('Name:')} ${templateInfo.name}`);
      console.log(`  ${chalk.bold('Type:')} ${templateInfo.type}`);
      console.log(`  ${chalk.bold('Description:')} ${templateInfo.description}`);
      console.log(`  ${chalk.bold('Tags:')} ${templateInfo.tags.join(', ')}`);
      console.log('');
    } catch (error) {
      console.log(`${chalk.red(folder)} - Invalid template configuration`);
    }
  });
  
  console.log(chalk.gray('Usage: npm run scaffold <template-name>'));
}
