/**
 * Shared utility functions for token processors
 */

/**
 * Convert camelCase or PascalCase to kebab-case
 * @param {string} str
 * @returns {string}
 */
export function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();
}

/**
 * Normalize token name by removing prefixes and converting to kebab-case
 * @param {string} name
 * @returns {string}
 */
export function normalizeTokenName(name) {
  return name.replace(/^sd\./, "").replace(/\./g, "-");
}

/**
 * Get token value with fallback
 * @param {object} token
 * @returns {any}
 */
export function getTokenValue(token) {
  return token.$value ?? token.value;
}