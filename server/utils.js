/**
 * Gets the OpenAI API key from environment variables
 * @returns {string|null} The API key or null if not set
 */
function getApiKey() {
  return process.env.OPENAI_API_KEY || null;
}

/**
 * Checks if the current environment is production
 * @returns {boolean} True if in production, false otherwise
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Safely parses JSON with error handling
 * @param {string} str - The string to parse
 * @param {any} fallback - The fallback value if parsing fails
 * @returns {any} The parsed object or the fallback
 */
function safeJsonParse(str, fallback = {}) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

module.exports = {
  getApiKey,
  isProduction,
  safeJsonParse
}; 