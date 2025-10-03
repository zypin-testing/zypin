import { registry } from '../core/registry.js';
import { extract } from './extract.js';
import { remove } from './remove.js';
import { removeNodes } from './removeNodes.js';
import { regex } from './regex.js';

// Register all filters
registry.registerFilter('extract', extract);
registry.registerFilter('remove', remove);
registry.registerFilter('removeLines', remove); // Alias
registry.registerFilter('removeNodes', removeNodes);
registry.registerFilter('regex', regex);

// Export for direct use
export { extract, remove, removeNodes, regex };

