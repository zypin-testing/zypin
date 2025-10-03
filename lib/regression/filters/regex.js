/**
 * Regex filter - Apply regex replacements to collected data
 * @param {any} data - Collected data
 * @param {Object} filterConfig - Filter configuration
 * @returns {any} Filtered data
 */
export async function regex(data, filterConfig) {
  const { pattern, replacement = '', flags = 'g' } = filterConfig;
  
  if (!pattern) {
    throw new Error('Regex filter requires a "pattern" field');
  }
  
  // For source data (HTML/text)
  if (data.content && typeof data.content === 'string') {
    const regex = new RegExp(pattern, flags);
    const content = data.content.replace(regex, replacement);
    
    return {
      ...data,
      content,
      filtered: true
    };
  }
  
  // For string data
  if (typeof data === 'string') {
    const regex = new RegExp(pattern, flags);
    return data.replace(regex, replacement);
  }
  
  return data;
}

