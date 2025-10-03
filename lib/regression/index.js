// Import to register all plugins
import './actions/index.js';
import './collectors/index.js';
import './comparators/index.js';
import './filters/index.js';

// Core exports
export { runSuite } from './core/runner.js';
export { loadSuite } from './core/suite-loader.js';
export { executeActions, collectData, compareData } from './core/executor.js';
export { registry } from './core/registry.js';

// Direct action exports
export * from './actions/index.js';

// Direct collector exports  
export * from './collectors/index.js';

// Direct comparator exports
export * from './comparators/index.js';

// Direct filter exports
export * from './filters/index.js';

