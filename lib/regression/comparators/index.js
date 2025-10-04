import { registry } from '../core/registry.js';
import { layout } from './layout.js';
import { source } from './source.js';
import { cookies } from './cookies.js';
import { jsErrors } from './jsErrors.js';
import { statusCodes } from './statusCodes.js';
import { performance } from './performance.js';

// Register all comparators
registry.registerComparator('layout', layout);
registry.registerComparator('source', source);
registry.registerComparator('cookies', cookies);
registry.registerComparator('jsErrors', jsErrors);
registry.registerComparator('statusCodes', statusCodes);
registry.registerComparator('performance', performance);

// Export for direct use
export { layout, source, cookies, jsErrors, statusCodes, performance };

