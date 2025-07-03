import { BaseTokenProcessor } from './base.js';
import type { Token, Dictionary, ProcessedToken, TokenProcessorConfig } from '../types.js';

/**
 * Processor for color tokens with theme support
 */
export class ColorTokenProcessor extends BaseTokenProcessor {
  constructor(options: TokenProcessorConfig = {} as TokenProcessorConfig) {
    super(options);
  }

  canProcess(token: Token): boolean {
    return token.$type === 'color';
  }

  process(token: Token, dictionary: Dictionary): ProcessedToken | null {
    const value = this.getTokenValue(token);

    // Use global theme processing logic
    const { finalPath, variant, isTheme } = this.processTokenPath(token);

    // Convert final path to kebab-case for CSS variable name
    const kebabPath = this.pathToKebabCase(finalPath);

    return {
      type: 'color',
      name: `--color-${kebabPath.join('-')}`,
      value,
      variant,
      isTheme
    };
  }


}