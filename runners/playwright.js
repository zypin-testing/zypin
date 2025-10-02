import { spawn } from 'child_process';
import { createRequire } from 'module';
import { glob } from 'glob';

const require = createRequire(import.meta.url);

export async function run(filePattern, config, options = {}) {
  const cwd = options.cwd || process.cwd();
  const files = await glob(filePattern, { cwd });

  if (files.length === 0) {
    console.log(`No tests found for pattern: ${filePattern}`);
    return;
  }

  return new Promise((resolve, reject) => {
    const playwrightCliPath = require.resolve('@playwright/test/cli', { paths: [cwd] });
    const args = [playwrightCliPath, 'test', ...files];

    // Add CLI arguments from config
    if (config && config.cliArgs && Array.isArray(config.cliArgs)) {
      args.push(...config.cliArgs);
    }

    const child = spawn('node', args, {
      stdio: 'inherit',
      cwd,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Playwright exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}
