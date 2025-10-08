import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function run(filePattern, options = {}) {
  const cwd = options.cwd || process.cwd();
  
  // Smart directory detection - auto-find tests in directory
  let actualPattern = filePattern;
  if (filePattern.endsWith('/')) {
    console.log(`Auto-detecting tests in directory: ${filePattern}`);
    
    // Try common test patterns in order of preference
    const testPatterns = [
      `${filePattern}tests/*.js`,
      `${filePattern}features/*.feature`,     // Cucumber BDD
      `${filePattern}*.test.js`, 
      `${filePattern}*.spec.js`,
      `${filePattern}*.feature`,              // Cucumber BDD
      `${filePattern}**/*.test.js`,
      `${filePattern}**/*.spec.js`,
      `${filePattern}**/*.feature`            // Cucumber BDD
    ];
    
    // Use glob to check which pattern has files
    const { glob } = await import('glob');
    let foundPattern = null;
    
    for (const pattern of testPatterns) {
      const files = await glob(pattern, { cwd });
      if (files.length > 0) {
        foundPattern = pattern;
        console.log(`Found ${files.length} test file(s) using pattern: ${pattern}`);
        break;
      }
    }
    
    if (!foundPattern) {
      throw new Error(`No test files found in directory: ${filePattern}`);
    }
    
    actualPattern = foundPattern;
  }
  
  console.log(`Running tests for pattern '${actualPattern}' in ${cwd}...`);
  
  // Check if we're in a template directory (has zypin.config.js)
  const localConfigPath = path.resolve(cwd, 'zypin.config.js');
  let configPath;
  let runCwd = cwd;
  
  if (fs.existsSync(localConfigPath)) {
    // We're inside a template directory
    configPath = localConfigPath;
  } else {
    // We're in project root, check if pattern starts with template folder
    const templateMatch = actualPattern.match(/^([^\/]+)\//);
    
    if (templateMatch) {
      const templateFolder = templateMatch[1];
      configPath = path.resolve(cwd, templateFolder, 'zypin.config.js');
      runCwd = path.resolve(cwd, templateFolder);
      
      if (!fs.existsSync(configPath)) {
        throw new Error(`zypin.config.js not found in template directory: ${path.join(cwd, templateFolder)}`);
      }
    } else {
      throw new Error(`zypin.config.js not found. Run tests from template directory or use pattern like "template-name/tests/*.js"`);
    }
  }
  
  const config = (await import(configPath)).default;
  const runnerName = config.runner;
  
  if (!runnerName) {
    throw new Error('No runner specified in zypin.config.js');
  }
  
  // Merge cliArgs: append CLI args (CLI wins due to last-flag-wins behavior)
  const mergedConfig = { 
    ...config, 
    cliArgs: [...(config.cliArgs || []), ...(options.cliArgs || [])]
  };
  
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const runnerPath = path.resolve(__dirname, '../../runners', `${runnerName}.js`);
  
  if (!fs.existsSync(runnerPath)) {
    throw new Error(`Runner '${runnerName}' not found.`);
  }
  
  const runner = await import(runnerPath);
  
  // Adjust pattern if we're running from template directory
  let finalPattern = actualPattern;
  if (runCwd !== cwd) {
    // We're running from template directory, strip the template prefix from pattern
    const templateName = path.basename(runCwd);
    if (actualPattern.startsWith(`${templateName}/`)) {
      finalPattern = actualPattern.substring(templateName.length + 1);
    }
  }
  
  await runner.run(finalPattern, mergedConfig, { cwd: runCwd });
  console.log(chalk.green('Test run completed successfully.'));
}
