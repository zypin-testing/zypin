import { spawn } from 'child_process';
import { glob } from 'glob';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const libCucumberPath = path.resolve(__dirname, '../lib/cucumber');

export async function run(filePattern, config, options = {}) {
  const cwd = options.cwd || process.cwd();
  console.log(chalk.blue('Running Cucumber BDD tests...'));

  const files = await glob(filePattern, { cwd });
  if (files.length === 0) {
    throw new Error(`No feature files found matching pattern: ${filePattern}`);
  }

  return new Promise((resolve, reject) => {
    const args = [
      'cucumber-js',
      ...files,
      '--require', `${libCucumberPath}/step-definitions/**/*.js`,
      '--require', `${libCucumberPath}/support/**/*.js`,
      '--require', 'step-definitions/**/*.js',
      '--require', 'support/**/*.js',
    ];

    // Add CLI arguments from config
    if (config.cliArgs && Array.isArray(config.cliArgs)) {
      args.push(...config.cliArgs);
    } else {
      // Default format if not specified
      args.push('--format', 'progress');
    }

    // Set environment variables from config
    const env = {
      ...process.env,
      ZYPIN_CONFIG: JSON.stringify(config)  // Pass full config for selenium driver creation
    };

    const cucumber = spawn('npx', args, {
      stdio: 'inherit',
      cwd,
      env,
    });

    cucumber.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Cucumber exited with code ${code}`));
      } else {
        resolve();
      }
    });

    cucumber.on('error', (err) => {
      reject(new Error(`Failed to start Cucumber process: ${err.message}`));
    });
  });
}
