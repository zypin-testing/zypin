import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function run() {
  const currentDir = process.cwd();
  const baseProjectPath = path.resolve(__dirname, '../../base-project');
  
  // Check if base-project exists
  if (!fs.existsSync(baseProjectPath)) {
    console.error(chalk.red('Error: base-project template not found'));
    process.exit(1);
  }
  
  // Check for conflicts (simple approach - throw error if key files exist)
  const conflicts = ['package.json', '.gitignore'].filter(file => 
    fs.existsSync(path.join(currentDir, file))
  );
  
  if (conflicts.length > 0) {
    console.error(chalk.red(`Error: Files already exist: ${conflicts.join(', ')}`));
    console.error(chalk.yellow('Please run in an empty directory or remove conflicting files'));
    process.exit(1);
  }
  
  console.log(chalk.blue('Initializing new testing project...'));
  
  // Copy all files from base-project
  const files = fs.readdirSync(baseProjectPath);
  for (const file of files) {
    const srcPath = path.join(baseProjectPath, file);
    let destPath = path.join(currentDir, file);
    
    if (file === 'package.json.template') {
      // Replace template variables
      const projectName = path.basename(currentDir);
      let content = fs.readFileSync(srcPath, 'utf-8');
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
      fs.writeFileSync(path.join(currentDir, 'package.json'), content);
    } else if (file === 'gitignore.template') {
      // Rename back to .gitignore
      destPath = path.join(currentDir, '.gitignore');
      fs.copySync(srcPath, destPath);
    } else {
      fs.copySync(srcPath, destPath);
    }
  }
  
  console.log(chalk.green('✓ Project initialized successfully!'));
  console.log(`
${chalk.bold('Next steps:')}
  ${chalk.cyan('npm install')}                       # Install dependencies
  ${chalk.cyan('npm run list')}                      # Show available templates  
  ${chalk.cyan('npm run scaffold <template>')}       # Add a testing template
`);
}
