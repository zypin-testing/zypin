/**
 * Remove nodes filter - Remove DOM nodes from HTML content
 * @param {any} data - Collected data
 * @param {Object} filterConfig - Filter configuration
 * @returns {any} Filtered data
 */
export async function removeNodes(data, filterConfig) {
  const { selectors = [] } = filterConfig;
  
  // For source data (HTML)
  if (data.content && typeof data.content === 'string') {
    let content = data.content;
    
    // Simple regex-based node removal (basic implementation)
    // In production, you'd use a proper HTML parser
    for (const selector of selectors) {
      // Remove elements with data attributes
      if (selector.startsWith('[data-')) {
        const attr = selector.slice(1, -1); // Remove [ and ]
        const regex = new RegExp(`<[^>]*\\s${attr}[^>]*>.*?</[^>]+>`, 'gs');
        content = content.replace(regex, '');
      }
      // Remove by tag name
      else {
        const tag = selector.replace(/[<>]/g, '');
        const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gs');
        content = content.replace(regex, '');
      }
    }
    
    return {
      ...data,
      content,
      selectorsRemoved: selectors.length
    };
  }
  
  return data;
}

