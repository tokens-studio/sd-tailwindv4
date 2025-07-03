import { BaseTokenProcessor } from './base.js';
import { objectToFlatCssProperties } from './utils.js';
import type { Token, Dictionary, ProcessedToken, TokenProcessorConfig } from '../types.js';

/**
 * Processor for composition tokens
 * Handles tokens of type 'composition' and generates @utility directives
 */
export class CompositionTokenProcessor extends BaseTokenProcessor {
  private utilityPrefix: string;
  private generateUtilities: boolean;

  constructor(options: TokenProcessorConfig = {} as TokenProcessorConfig) {
    super(options);
    this.utilityPrefix = options.utilityGeneration?.prefix || 'u-';
    this.generateUtilities = options.utilityGeneration?.enabled !== false;
  }

  canProcess(token: Token): boolean {
    return token.$type === 'composition' || 
           (token.$type === 'utility' && token.$extensions?.$type === 'utility');
  }

  process(token: Token, _dictionary: Dictionary): ProcessedToken | null {
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