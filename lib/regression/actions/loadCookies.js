import fs from 'fs';
import path from 'path';

/**
 * Normalize cookie sameSite values for Playwright compatibility
 */
function normalizeCookies(cookies) {
  return cookies.map(cookie => {
    const normalized = { ...cookie };
    
    // Handle sameSite values
    if (normalized.sameSite === null || normalized.sameSite === undefined) {
      normalized.sameSite = 'Lax';
    } else if (typeof normalized.sameSite === 'string') {
      const sameSite = normalized.sameSite.toLowerCase();
      if (sameSite === 'lax') {
        normalized.sameSite = 'Lax';
      } else if (sameSite === 'strict') {
        normalized.sameSite = 'Strict';
      } else if (sameSite === 'none' || sameSite === 'no_restriction') {
        normalized.sameSite = 'None';
      } else {
        normalized.sameSite = 'Lax';
      }
    }
    
    return normalized;
  });
}

/**
 * Load cookies action - Load cookies from file or inline configuration
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function loadCookies(page, context, action) {
  let cookies;
  
  if (action.filePath) {
    // Load from file
    const cookieFilePath = path.resolve(action.filePath);
    if (!fs.existsSync(cookieFilePath)) {
      throw new Error(`Cookie file not found: ${cookieFilePath}`);
    }
    const cookieData = fs.readFileSync(cookieFilePath, 'utf8');
    cookies = JSON.parse(cookieData);
  } else if (action.cookies && Array.isArray(action.cookies)) {
    // Use inline cookies
    cookies = action.cookies;
  } else {
    throw new Error('loadCookies action requires either "filePath" or "cookies" array');
  }
  
  // Normalize and add cookies using Playwright native API
  const normalizedCookies = normalizeCookies(cookies);
  await context.addCookies(normalizedCookies);
}

