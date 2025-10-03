import { registry } from '../core/registry.js';

// Basic actions
import { click } from './click.js';
import { hide } from './hide.js';
import { sleep } from './sleep.js';
import { loadCookies } from './loadCookies.js';

// Advanced actions
import { scroll } from './scroll.js';
import { executeScript } from './executeScript.js';
import { waitForElement } from './waitForElement.js';
import { waitForPageLoaded } from './waitForPageLoaded.js';
import { type } from './type.js';
import { hover } from './hover.js';
import { select } from './select.js';
import { check } from './check.js';
import { uncheck } from './uncheck.js';
import { setViewport } from './setViewport.js';
import { replaceText } from './replaceText.js';
import { waitForImages } from './waitForImages.js';

// Register basic actions
registry.registerAction('click', click);
registry.registerAction('hide', hide);
registry.registerAction('sleep', sleep);
registry.registerAction('loadCookies', loadCookies);

// Register advanced actions
registry.registerAction('scroll', scroll);
registry.registerAction('executeScript', executeScript);
registry.registerAction('waitForElement', waitForElement);
registry.registerAction('waitForPageLoaded', waitForPageLoaded);
registry.registerAction('type', type);
registry.registerAction('fill', type); // Alias for type
registry.registerAction('hover', hover);
registry.registerAction('select', select);
registry.registerAction('check', check);
registry.registerAction('uncheck', uncheck);
registry.registerAction('setViewport', setViewport);
registry.registerAction('replaceText', replaceText);
registry.registerAction('waitForImages', waitForImages);

// Export for direct use
export {
  // Basic
  click,
  hide,
  sleep,
  loadCookies,
  // Advanced
  scroll,
  executeScript,
  waitForElement,
  waitForPageLoaded,
  type,
  hover,
  select,
  check,
  uncheck,
  setViewport,
  replaceText,
  waitForImages
};

