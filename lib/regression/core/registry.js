/**
 * Plugin registry for actions, collectors, comparators, and filters
 */
class Registry {
  constructor() {
    this.actions = new Map();
    this.collectors = new Map();
    this.comparators = new Map();
    this.filters = new Map();
  }

  registerAction(name, handler) {
    this.actions.set(name, handler);
  }

  registerCollector(name, handler) {
    this.collectors.set(name, handler);
  }

  registerComparator(name, handler) {
    this.comparators.set(name, handler);
  }

  registerFilter(name, handler) {
    this.filters.set(name, handler);
  }

  getAction(name) {
    if (!this.actions.has(name)) {
      throw new Error(`Unknown action type: ${name}`);
    }
    return this.actions.get(name);
  }

  getCollector(name) {
    if (!this.collectors.has(name)) {
      throw new Error(`Unknown collector type: ${name}`);
    }
    return this.collectors.get(name);
  }

  getComparator(name) {
    if (!this.comparators.has(name)) {
      throw new Error(`Unknown comparator type: ${name}`);
    }
    return this.comparators.get(name);
  }

  getFilter(name) {
    if (!this.filters.has(name)) {
      throw new Error(`Unknown filter type: ${name}`);
    }
    return this.filters.get(name);
  }
}

export const registry = new Registry();

