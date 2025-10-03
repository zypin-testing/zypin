/**
 * Performance collector - Collect Core Web Vitals and performance metrics
 * @param {Object} page - Playwright page
 * @param {Object} config - Collector configuration
 * @returns {Promise<Object>} Performance data
 */
export async function performance(page, config) {
  // Collect performance metrics using Playwright native API
  const metrics = await page.evaluate(() => {
    const perf = window.performance;
    const navigation = perf.getEntriesByType('navigation')[0];
    const paint = perf.getEntriesByType('paint');
    
    return {
      // Navigation timing
      navigation: navigation ? {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive,
        duration: navigation.duration
      } : null,
      
      // Paint metrics
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      
      // Resource counts
      resourceCount: perf.getEntriesByType('resource').length,
      
      // Memory (if available)
      memory: window.performance.memory ? {
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize
      } : null
    };
  });
  
  return {
    url: page.url(),
    metrics
  };
}

