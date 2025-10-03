/**
 * Wait for images action - Wait for all images to finish loading
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function waitForImages(page, context, action) {
  const timeout = action.timeout || 30000;

  // Wait for all images to load using Playwright native evaluate
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.complete && img.naturalHeight !== 0);
  }, { timeout });
}

