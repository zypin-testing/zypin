import { spawn } from 'child_process';
import { createRequire } from 'module';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function run(filePattern, config, options = {}) {
  const cwd = options.cwd || process.cwd();
  const files = await glob(filePattern, { cwd });

  if (files.length === 0) {
    console.log(`No tests found for pattern: ${filePattern}`);
    return;
  }

  return new Promise((resolve, reject) => {
    // Resolve Playwright CLI from zypin's node_modules, not user's project
    const zypinNodeModules = path.resolve(__dirname, '../node_modules');
    const playwrightCliPath = require.resolve('@playwright/test/cli', { paths: [zypinNodeModules] });
    const args = [playwrightCliPath, 'test', ...files];

    // Add CLI arguments from config
    if (config && config.cliArgs && Array.isArray(config.cliArgs)) {
      args.push(...config.cliArgs);
    }

    const child = spawn('node', args, {
      stdio: 'inherit',
      cwd,
      env: {
        ...process.env,
        // Set HTML report output to current working directory to avoid parent folder issue
        PLAYWRIGHT_HTML_REPORT: './playwright-report'
      }
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
