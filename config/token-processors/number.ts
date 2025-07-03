import { BaseTokenProcessor } from './base.js';
import type { Token, Dictionary, ProcessedToken, TokenProcessorConfig } from '../types.js';

/**
 * Processor for number tokens
 * Handles tokens of type 'number' (e.g., z-index values)
 */
export class NumberTokenProcessor extends BaseTokenProcessor {
  private numberPrefix: string;

  constructor(options: TokenProcessorConfig = {} as TokenProcessorConfig) {
    super(options);
    this.numberPrefix = options.numberPrefix || '';
  }

  canProcess(token: Token): boolean {
    return token.$type === 'number';
  }

  process(token: Token, _dictionary: Dictionary): ProcessedToken | null {
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
   */
  getNumberPrefix(path: string[]): string {
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