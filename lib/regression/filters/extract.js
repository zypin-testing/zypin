/**
 * Extract filter - Extract specific elements or data from collected data
 * @param {any} data - Collected data
 * @param {Object} filterConfig - Filter configuration
 * @returns {any} Filtered data
 */
export async function extract(data, filterConfig) {
  const { selector, attribute, property } = filterConfig;
  
  // For source data (HTML)
  if (data.content && typeof data.content === 'string') {
    // Simple text-based extraction (could be enhanced with DOM parsing)
    const regex = new RegExp(selector || '.*', 'g');
    const matches = data.content.match(regex) || [];
    
    return {
      ...data,
      content: matches.join('\n'),
      extracted: matches.length
    };
  }
  
  // For object/array data
  if (property && typeof data === 'object') {
    const extracted = property.split('.').reduce((obj, key) => obj?.[key], data);
    return extracted;
  }
  
  return data;
}

