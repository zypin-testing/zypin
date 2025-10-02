import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

/**
 * List all available templates with metadata
 */
export function listAllTemplates() {
  const folders = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  return folders.map(folder => {
    try {
      const pkgPath = path.join(TEMPLATES_DIR, folder, 'package.json');
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      if (pkgJson.zypin_template) {
        return {
          id: folder,
          name: pkgJson.zypin_template.name,
          type: pkgJson.zypin_template.type,
          description: pkgJson.zypin_template.description,
          tags: pkgJson.zypin_template.tags
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}
