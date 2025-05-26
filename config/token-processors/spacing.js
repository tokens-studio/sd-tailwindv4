import { BaseTokenProcessor } from './base.js';
import { toKebabCase } from './utils.js';

/**
 * Processor for spacing/dimension tokens with proper Tailwind CSS v4 naming
 */
export class SpacingTokenProcessor extends BaseTokenProcessor {
  constructor(options = {}) {
    super(options);
    this.defaultPrefix = options.spacingPrefix || 'spacing';

    // Define special prefixes for specific token categories
    this.specialPrefixes = {
      'radius': 'radius',
      'container': 'container',
      'breakpoint': 'breakpoint',
      'aspect': 'aspect'
    };
  }

  canProcess(token) {
    // Process dimension, sizing, and spacing tokens
    if (!['dimension', 'sizing', 'spacing'].includes(token.$type)) {
      return false;
    }

    // Exclude tokens that were originally letterSpacing
    if (token.$extensions && token.$extensions['studio.tokens'] && token.$extensions['studio.tokens'].originalType === 'letterSpacing') {
      return false;
    }

    // Exclude tokens that have 'tracking' in their name (letterSpacing tokens)
    if (token.name && token.name.includes('tracking')) {
      return false;
    }

    return true;
  }

  process(token, dictionary) {
    const value = this.getTokenValue(token);

    // Use global theme processing logic
    const { finalPath, variant, isTheme } = this.processTokenPath(token);

    // Convert to kebab-case
    let path = this.pathToKebabCase(finalPath);

    // Determine the appropriate prefix based on the first path segment
    let prefix = this.defaultPrefix;
    const firstSegment = path[0];

    if (this.specialPrefixes[firstSegment]) {
      prefix = this.specialPrefixes[firstSegment];
      // Remove the first segment since it becomes the prefix
      path = path.slice(1);
    } else {
      // For regular spacing tokens, remove redundant prefix if present
      const prefixKebab = toKebabCase(prefix);
      if (path[0] === prefixKebab) {
        path = path.slice(1);
      }
    }

    // Special handling for aspect ratio tokens - preserve original string value
    let processedValue = value;
    if (prefix === 'aspect') {
      // For aspect ratios, use the original $value to preserve ratio format
      processedValue = token.original?.$value || token.$value || value;
    }

    return {
      type: 'spacing',
      name: `--${prefix}-${path.join('-')}`,
      value: processedValue,
      variant,
      isTheme
    };
  }
}