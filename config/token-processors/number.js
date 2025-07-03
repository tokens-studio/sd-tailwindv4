import { BaseTokenProcessor } from './base.js';

/**
 * Processor for number tokens
 * Handles tokens of type 'number' (e.g., z-index values)
 */
export class NumberTokenProcessor extends BaseTokenProcessor {
  constructor(options = {}) {
    super(options);
    this.numberPrefix = options.numberPrefix || '';
  }

  /**
   * Check if this processor can handle the given token
   * @param {object} token
   * @returns {boolean}
   */
  canProcess(token) {
    return token.$type === 'number';
  }

  /**
   * Process number token and generate CSS custom property
   * @param {object} token
   * @param {object} dictionary
   * @returns {object}
   */
  process(token, dictionary) {
    const tokenValue = this.getTokenValue(token);
    if (tokenValue === null || tokenValue === undefined) {
      return null;
    }

    const { finalPath, variant, isTheme } = this.processTokenPath(token);
    
    // Determine the appropriate prefix based on the token path
    const prefix = this.getNumberPrefix(finalPath);
    const kebabPath = this.pathToKebabCase(finalPath);
    
    // Build the CSS custom property name
    const propertyName = `--${prefix}${kebabPath.join('-')}`;

    return {
      type: 'number',
      name: propertyName,
      value: tokenValue.toString(),
      variant: variant,
      isTheme: isTheme
    };
  }

  /**
   * Get the appropriate prefix for number tokens based on their path
   * @param {string[]} path
   * @returns {string}
   */
  getNumberPrefix(path) {
    // Check if this is a z-index token
    if (path.includes('zIndex') || path.includes('z-index') || path.some(p => p.toLowerCase().includes('zindex'))) {
      return 'z-';
    }
    
    // Check if this is a layout-related token
    if (path.includes('layout')) {
      return '';
    }
    
    // Default prefix
    return this.numberPrefix;
  }
}