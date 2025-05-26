import { BaseTokenProcessor } from './base.js';
import { toKebabCase, normalizeTokenName } from './utils.js';

/**
 * Processor for utility tokens that generate @utility directives
 */
export class UtilityTokenProcessor extends BaseTokenProcessor {
  canProcess(token) {
    return token.$type === 'utility';
  }

  process(token, dictionary) {
    const value = this.getTokenValue(token);
    const name = normalizeTokenName(token.name);

    if (typeof value !== 'object') {
      return null;
    }

    const properties = Object.entries(value)
      .map(([key, val]) => {
        const cssKey = toKebabCase(key);
        const cssValue = typeof val === 'object' && '$value' in val ? val.$value : val;
        return `${cssKey}: ${cssValue}`;
      })
      .join(';\n  ');

    return {
      type: 'utility',
      name,
      properties: `@utility ${name} {\n  ${properties};\n}`
    };
  }
}