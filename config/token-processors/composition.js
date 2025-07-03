import { BaseTokenProcessor } from './base.js';
import { objectToFlatCssProperties } from './utils.js';

/**
 * Processor for composition tokens
 * Handles tokens of type 'composition' and generates @utility directives
 */
export class CompositionTokenProcessor extends BaseTokenProcessor {
  constructor(options = {}) {
    super(options);
    this.utilityPrefix = options.utilityGeneration?.prefix || 'u-';
    this.generateUtilities = options.utilityGeneration?.enabled !== false;
  }

  /**
   * Check if this processor can handle the given token
   * @param {object} token
   * @returns {boolean}
   */
  canProcess(token) {
    return token.$type === 'composition' || 
           (token.$type === 'utility' && token.$extensions?.$type === 'utility');
  }

  /**
   * Process composition token and generate @utility directive
   * @param {object} token
   * @param {object} dictionary
   * @returns {object}
   */
  process(token, dictionary) {
    const tokenValue = this.getTokenValue(token);
    if (!tokenValue || typeof tokenValue !== 'object') {
      return null;
    }

    const { variant, isTheme } = this.processTokenPath(token);
    // Use Style Dictionary's transformed name for consistent naming
    const utilityName = token.name;
    
    // Convert object properties to CSS
    const cssProperties = objectToFlatCssProperties(tokenValue);
    
    // Create @utility directive
    const utilityDirective = `@utility ${utilityName} {\n  ${cssProperties}\n}`;

    return {
      type: 'composition',
      name: utilityName,
      value: utilityDirective,
      properties: utilityDirective,
      variant: variant,
      isTheme: isTheme
    };
  }
}