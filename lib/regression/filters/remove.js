/**
 * Remove filter - Remove lines matching patterns from text data
 * @param {any} data - Collected data
 * @param {Object} filterConfig - Filter configuration
 * @returns {any} Filtered data
 */
export async function remove(data, filterConfig) {
  const { patterns = [], lines = [] } = filterConfig;
  
  // For source data (HTML/text)
  if (data.content && typeof data.content === 'string') {
    let content = data.content;
    const contentLines = content.split('\n');
    
    // Remove specific line numbers
    let filteredLines = contentLines.filter((line, index) => {
      return !lines.includes(index + 1); // 1-based line numbers
    });
    
    // Remove lines matching patterns
    if (patterns.length > 0) {
      filteredLines = filteredLines.filter(line => {
        return !patterns.some(pattern => {
          const regex = new RegExp(pattern);
          return regex.test(line);
        });
      });
    }
    
    return {
      ...data,
      content: filteredLines.join('\n'),
      removedLines: contentLines.length - filteredLines.length
    };
  }
  
  return data;
}

