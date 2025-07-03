import { BaseTokenProcessor } from './base.js';
import { toKebabCase, normalizeTokenName } from './utils.js';
import type { Token, Dictionary, ProcessedToken, TokenProcessorConfig } from '../types.js';

/**
 * Processor for utility tokens that generate @utility directives
 */
export class UtilityTokenProcessor extends BaseTokenProcessor {
  constructor(options: TokenProcessorConfig = {} as TokenProcessorConfig) {
    super(options);
  }

  canProcess(token: Token): boolean {
    return token.$type === 'utility';
  }

  process(token: Token, dictionary: Dictionary): ProcessedToken | null {
    const value = this.getTokenValue(token);
    // Use Style Dictionary's transformed name for consistent naming
    const name = token.name;

    if (typeof value !== 'object') {
      return null;
    }

    const properties = Object.entries(value)
      .map(([key, val]) => {
        const cssKey = toKebabCase(key);
        const cssValue = (typeof val === 'object' && val !== null && '$value' in val) ? (val as any).$value : val;
        return `${cssKey}: ${cssValue}`;
      })
      .join(';\n  ');

    return {
      type: 'utility',
      name,
      value: `@utility ${name} {\n  ${properties};\n}`,
      properties: `@utility ${name} {\n  ${properties};\n}`
    };
  }
}