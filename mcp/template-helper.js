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
      const templateJsonPath = path.join(TEMPLATES_DIR, folder, '.template.json');
      if (!fs.existsSync(templateJsonPath)) {
        return null;
      }
      
      const templateInfo = JSON.parse(fs.readFileSync(templateJsonPath, 'utf-8'));
      
      return {
        id: folder,
        name: templateInfo.name,
        type: templateInfo.type,
        description: templateInfo.description,
        tags: templateInfo.tags
      };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}
