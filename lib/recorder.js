/**
 * Browser Recorder for AI-Assisted Test Writing
 * Captures user interactions and provides them to AI Agent for test creation
 */

/**
 * Injection script that runs in the browser to capture user interactions
 * Captures 5 core events: click, input, change, submit, keydown (Enter only)
 */
export const injectionScript = `
(function() {
  // Prevent multiple injections
  if (window.__zypin_recorder_injected) return;
  window.__zypin_recorder_injected = true;

  // Debounce helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Check if name is unique in document
  function isUniqueName(name) {
    return document.querySelectorAll(\`[name="\${name}"]\`).length === 1;
  }

  // Generate CSS path for element
  function generateCSSPath(el) {
    if (!(el instanceof Element)) return '';
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break;
      } else {
        let sibling = el;
        let nth = 1;
        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          if (sibling.nodeName.toLowerCase() === selector) nth++;
        }
        if (nth !== 1) selector += ':nth-of-type(' + nth + ')';
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(' > ');
  }

  // Generate selector for element (priority: data-testid > id > name > CSS)
  function generateSelector(el) {
    if (!el) return '';
    if (el.dataset && el.dataset.testid) return \`[data-testid="\${el.dataset.testid}"]\`;
    if (el.id) return '#' + el.id;
    if (el.name && isUniqueName(el.name)) return \`[name="\${el.name}"]\`;
    return generateCSSPath(el);
  }

  // Generate alternative selectors for fallback options
  function generateAlternativeSelectors(el) {
    if (!el) return [];
    const alternatives = [];
    
    // data-testid
    if (el.dataset && el.dataset.testid) {
      alternatives.push(\`[data-testid="\${el.dataset.testid}"]\`);
    }
    
    // id
    if (el.id) {
      alternatives.push('#' + el.id);
    }
    
    // name
    if (el.name) {
      alternatives.push(\`[name="\${el.name}"]\`);
    }
    
    // aria-label
    if (el.getAttribute('aria-label')) {
      alternatives.push(\`[aria-label="\${el.getAttribute('aria-label')}"]\`);
    }
    
    // role + aria-label combination
    if (el.getAttribute('role') && el.getAttribute('aria-label')) {
      alternatives.push(\`[role="\${el.getAttribute('role')}"][aria-label="\${el.getAttribute('aria-label')}"]\`);
    }
    
    // placeholder for inputs
    if (el.placeholder) {
      alternatives.push(\`[placeholder="\${el.placeholder}"]\`);
    }
    
    // text content for buttons/links
    const text = getElementText(el);
    if (text && (el.tagName === 'BUTTON' || el.tagName === 'A')) {
      alternatives.push(\`\${el.tagName.toLowerCase()}:has-text("\${text}")\`);
    }
    
    // CSS path as last resort
    alternatives.push(generateCSSPath(el));
    
    // Remove duplicates and return
    return [...new Set(alternatives)];
  }

  // Get element text content (truncated)
  function getElementText(el) {
    if (!el) return '';
    const text = el.innerText || el.textContent || el.value || el.placeholder || '';
    return text.trim().substring(0, 50);
  }

  // Get element label
  function getElementLabel(el) {
    if (!el) return '';
    // Check for aria-label
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
    // Check for associated label
    if (el.id) {
      const label = document.querySelector(\`label[for="\${el.id}"]\`);
      if (label) return getElementText(label);
    }
    // Check for parent label
    const parentLabel = el.closest('label');
    if (parentLabel) return getElementText(parentLabel);
    // Check for placeholder
    if (el.placeholder) return el.placeholder;
    return '';
  }

  // Generate human-readable description
  function generateDescription(type, el, value) {
    const tag = el.tagName.toLowerCase();
    const text = getElementText(el);
    const label = getElementLabel(el);
    
    switch(type) {
      case 'click':
        if (text) return \`Clicked on '\${text}' \${tag}\`;
        if (label) return \`Clicked on \${tag} labeled '\${label}'\`;
        return \`Clicked on \${tag}\`;
      
      case 'type':
        if (label) return \`Entered text in '\${label}' field\`;
        if (el.name) return \`Entered text in '\${el.name}' field\`;
        return \`Entered text in \${tag}\`;
      
      case 'select':
        const selectedText = el.options ? el.options[el.selectedIndex]?.text : value;
        if (label) return \`Selected '\${selectedText}' from '\${label}' dropdown\`;
        return \`Selected '\${selectedText}' from dropdown\`;
      
      case 'check':
        if (label) return \`Checked '\${label}' checkbox\`;
        return \`Checked checkbox\`;
      
      case 'uncheck':
        if (label) return \`Unchecked '\${label}' checkbox\`;
        return \`Unchecked checkbox\`;
      
      case 'submit':
        return \`Submitted form\`;
      
      case 'keypress':
        if (label) return \`Pressed Enter in '\${label}' field\`;
        return \`Pressed Enter in \${tag}\`;
      
      default:
        return \`Interacted with \${tag}\`;
    }
  }

  // Get element metadata with all useful attributes for fallback selector generation
  function getElementMetadata(el) {
    if (!el) return {};
    
    const metadata = {
      tag: el.tagName.toLowerCase(),
      text: getElementText(el),
      type: el.type || undefined,
      value: el.value || undefined,
      checked: el.type === 'checkbox' || el.type === 'radio' ? el.checked : undefined
    };
    
    // Add common attributes that might be useful for alternative selectors
    if (el.id) metadata.id = el.id;
    if (el.name) metadata.name = el.name;
    if (el.className) metadata.class = el.className;
    if (el.placeholder) metadata.placeholder = el.placeholder;
    if (el.title) metadata.title = el.title;
    if (el.href) metadata.href = el.href;
    if (el.getAttribute('role')) metadata.role = el.getAttribute('role');
    if (el.getAttribute('aria-label')) metadata.ariaLabel = el.getAttribute('aria-label');
    if (el.getAttribute('aria-labelledby')) metadata.ariaLabelledby = el.getAttribute('aria-labelledby');
    
    // Add all data-* attributes (useful for alternative test ids)
    const dataAttrs = {};
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (attr.name.startsWith('data-')) {
        dataAttrs[attr.name] = attr.value;
      }
    }
    if (Object.keys(dataAttrs).length > 0) {
      metadata.dataAttributes = dataAttrs;
    }
    
    // Add parent context for better understanding
    if (el.parentElement) {
      metadata.parent = {
        tag: el.parentElement.tagName.toLowerCase(),
        id: el.parentElement.id || undefined,
        class: el.parentElement.className || undefined
      };
    }
    
    return metadata;
  }

  // Record action
  function recordAction(type, el, value) {
    if (!window.__recordAction) return;
    
    const action = {
      type,
      selector: generateSelector(el),
      alternativeSelectors: generateAlternativeSelectors(el),
      description: generateDescription(type, el, value),
      element: getElementMetadata(el)
    };
    
    if (value !== undefined) {
      action.value = value;
    }
    
    window.__recordAction(action);
  }

  // Click event listener
  document.addEventListener('click', (e) => {
    const el = e.target;
    recordAction('click', el);
  }, true);

  // Input event listener (debounced for text inputs)
  const debouncedInput = debounce((el, value) => {
    recordAction('type', el, value);
  }, 300);

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      debouncedInput(el, el.value);
    }
  }, true);

  // Change event listener (for selects, checkboxes, radios)
  document.addEventListener('change', (e) => {
    const el = e.target;
    
    if (el.tagName === 'SELECT') {
      recordAction('select', el, el.value);
    } else if (el.type === 'checkbox') {
      recordAction(el.checked ? 'check' : 'uncheck', el);
    } else if (el.type === 'radio') {
      recordAction('check', el, el.value);
    }
  }, true);

  // Submit event listener
  document.addEventListener('submit', (e) => {
    const el = e.target;
    recordAction('submit', el);
  }, true);

  // Keydown event listener (Enter key only)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const el = e.target;
      // Only record if it's in an input field (not for submit buttons)
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        recordAction('keypress', el, 'Enter');
      }
    }
  }, true);

  // Add visual recording indicator
  const indicator = document.createElement('div');
  indicator.id = '__recording_indicator';
  indicator.style.cssText = \`
    position: fixed;
    top: 10px;
    right: 10px;
    width: 12px;
    height: 12px;
    background: red;
    border-radius: 50%;
    z-index: 999999;
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
    animation: __recording_pulse 1.5s infinite;
  \`;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes __recording_pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(255, 0, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
    }
  \`;
  
  document.head.appendChild(style);
  document.body.appendChild(indicator);

  // Inject into iframes
  function injectIntoIframes() {
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        // Try to access iframe content
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc && !iframe.contentWindow.__zypin_recorder_injected) {
          // Re-run this script in iframe context
          iframe.contentWindow.eval(arguments.callee.toString() + '()');
        }
      } catch (e) {
        // Cross-origin iframe, skip
        console.debug('Cannot inject into iframe (cross-origin):', e.message);
      }
    });
  }

  // Inject into existing iframes
  injectIntoIframes();

  // Watch for new iframes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.tagName === 'IFRAME') {
          setTimeout(() => injectIntoIframes(), 100);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  console.log('🔴 Zypin Recorder: Recording started');
})();
`;

/**
 * Setup recording on a page by injecting the recording script
 * Also injects into all accessible iframes
 * @param {Page} page - Playwright page object
 */
export async function setupRecording(page) {
  try {
    // Inject into main page
    await page.evaluate(injectionScript);
    
    // Inject into all frames (including iframes)
    const frames = page.frames();
    for (const frame of frames) {
      // Skip main frame (already injected)
      if (frame === page.mainFrame()) continue;
      
      try {
        await frame.evaluate(injectionScript);
      } catch (e) {
        // Skip inaccessible iframes (cross-origin)
        console.error(`Cannot inject into frame: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error setting up recording:', error);
    throw error;
  }
}

