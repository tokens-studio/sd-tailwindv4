import { BaseTokenProcessor } from './base.js';

/**
 * Processor for color tokens with theme support
 */
export class ColorTokenProcessor extends BaseTokenProcessor {
  constructor(options = {}) {
    super(options);
  }

  canProcess(token) {
    return token.$type === 'color';
  }

  process(token, dictionary) {
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