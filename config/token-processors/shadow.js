import { BaseTokenProcessor } from './base.js';
import { toKebabCase } from './utils.js';

/**
 * Processor for shadow tokens
 */
export class ShadowTokenProcessor extends BaseTokenProcessor {
  constructor(options = {}) {
    super(options);
    this.prefix = options.shadowPrefix || 'shadow';
  }

  canProcess(token) {
    return token.$type === 'boxShadow' || token.$type === 'shadow';
  }

  process(token, dictionary) {
    const value = this.getTokenValue(token);

    // Use global theme processing logic
    const { finalPath, variant, isTheme } = this.processTokenPath(token);

    // Convert to kebab-case
    let path = this.pathToKebabCase(finalPath);

    // Remove the "shadow" prefix if present (first segment)
    if (path[0] === 'shadow') {
      path = path.slice(1);
    }

    // Handle both single shadow objects and arrays of shadows
    let shadowValue;
    if (Array.isArray(value)) {
      shadowValue = value.map(shadow => this.formatShadow(shadow)).join(', ');
    } else if (typeof value === 'object') {
      shadowValue = this.formatShadow(value);
    } else {
      shadowValue = value;
    }

    return {
      type: 'shadow',
      name: `--${this.prefix}-${path.join('-')}`,
      value: shadowValue,
      variant,
      isTheme
    };
  }

  /**
   * Format a shadow object into CSS shadow syntax
   * @param {object} shadow
   * @returns {string}
   */
  formatShadow(shadow) {
    const {
      offsetX = '0',
      offsetY = '0',
      blur = '0',
      spread = '0',
      color = 'transparent',
      inset = false
    } = shadow;

    const parts = [
      inset ? 'inset' : '',
      offsetX,
      offsetY,
      blur,
      spread,
      color
    ].filter(Boolean);

    return parts.join(' ');
  }
}