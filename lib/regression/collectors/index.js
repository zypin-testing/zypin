import { registry } from '../core/registry.js';
import { screen } from './screen.js';
import { source } from './source.js';
import { cookies } from './cookies.js';
import { jsErrors } from './jsErrors.js';
import { statusCodes } from './statusCodes.js';
import { performance } from './performance.js';

// Register all collectors
registry.registerCollector('screen', screen);
registry.registerCollector('source', source);
registry.registerCollector('cookies', cookies);
registry.registerCollector('jsErrors', jsErrors);
registry.registerCollector('statusCodes', statusCodes);
registry.registerCollector('performance', performance);

// Export for direct use
export { screen, source, cookies, jsErrors, statusCodes, performance };

