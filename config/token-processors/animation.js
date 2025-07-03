import { BaseTokenProcessor } from './base.js';
import { toKebabCase } from './utils.js';

/**
 * Processor for animation-related tokens (duration, cubicBezier, transition, keyframes)
 */
export class AnimationTokenProcessor extends BaseTokenProcessor {
  constructor(options = {}) {
    super(options);
  }

  canProcess(token) {
    return ['duration', 'cubicBezier', 'transition', 'keyframes'].includes(token.$type);
  }

  process(token, dictionary) {
    // For transition tokens, we need to work with the original $value object
    // before Style Dictionary tries to resolve it as a string
    const value = token.$type === 'transition' ? token.original.$value || token.$value : this.getTokenValue(token);

    // Use global theme processing logic
    const { finalPath, variant, isTheme } = this.processTokenPath(token);

    // Convert to kebab-case
    let path = this.pathToKebabCase(finalPath);

    // Remove the "animation" prefix if present (first segment)
    if (path[0] === 'animation') {
      path = path.slice(1);
    }

    // Handle different animation token types
    switch (token.$type) {
      case 'duration':
        return this.processDuration(path, value, variant, isTheme);

      case 'cubicBezier':
        return this.processCubicBezier(path, value, variant, isTheme);

      case 'transition':
        return this.processTransition(path, value, token, dictionary, variant, isTheme);

      case 'keyframes':
        return this.processKeyframes(path, value, variant, isTheme);

      default:
        return null;
    }
  }

  processDuration(path, value, variant, isTheme) {
    // Remove redundant "duration" from path
    if (path[0] === 'duration') {
      path = path.slice(1);
    }

    // Generate duration custom properties
    // e.g., --duration-fast, --duration-normal
    return {
      type: 'animation',
      name: `--duration-${path.join('-')}`,
      value: value,
      variant,
      isTheme
    };
  }

  processCubicBezier(path, value, variant, isTheme) {
    // Remove redundant "easing" from path
    if (path[0] === 'easing') {
      path = path.slice(1);
    }

    // Convert array to CSS cubic-bezier function
    let cssValue;
    if (Array.isArray(value)) {
      cssValue = `cubic-bezier(${value.join(', ')})`;
    } else {
      cssValue = value;
    }

    // Generate easing custom properties
    // e.g., --ease-in, --ease-out, --ease-linear
    return {
      type: 'animation',
      name: `--ease-${path.join('-')}`,
      value: cssValue,
      variant,
      isTheme
    };
  }

      processTransition(path, value, token, dictionary, variant, isTheme) {
    // Remove redundant "transition" from path
    if (path[0] === 'transition') {
      path = path.slice(1);
    }

    // Handle transition objects with duration, timingFunction, property
    if (typeof value === 'object' && value !== null) {
      let { duration, timingFunction, property, delay } = value;

      // Manually resolve token references using Style Dictionary's resolver
      if (typeof duration === 'string' && duration.startsWith('{') && duration.endsWith('}')) {
        const referencePath = duration.slice(1, -1).split('.');
        const resolvedToken = this.findTokenByPath(dictionary, referencePath);
        duration = resolvedToken ? this.getTokenValue(resolvedToken) : duration;
      }

      if (typeof timingFunction === 'string' && timingFunction.startsWith('{') && timingFunction.endsWith('}')) {
        const referencePath = timingFunction.slice(1, -1).split('.');
        const resolvedToken = this.findTokenByPath(dictionary, referencePath);
        timingFunction = resolvedToken ? this.getTokenValue(resolvedToken) : timingFunction;
      }

      // property should be a literal value, not a token reference
      // delay is optional and rarely used

      // Build transition shorthand in correct order: property duration timing-function delay
      const parts = [];

      // Add property first (e.g., "all", "color", etc.)
      if (property !== undefined && property !== null && property !== '') {
        parts.push(property);
      }

      // Add duration (e.g., "250ms")
      if (duration !== undefined && duration !== null && duration !== '') {
        parts.push(duration);
      }

      // Add timing function (e.g., "ease", "cubic-bezier(...)")
      if (timingFunction !== undefined && timingFunction !== null && timingFunction !== '') {
        parts.push(timingFunction);
      }

      // Only add delay if it exists and is not undefined
      if (delay !== undefined && delay !== null && delay !== '') {
        parts.push(delay);
      }

      const transitionValue = parts.join(' ');

      return {
        type: 'animation',
        name: `--transition-${path.join('-')}`,
        value: transitionValue,
        variant,
        isTheme
      };
    }

    // Handle simple transition values
    return {
      type: 'animation',
      name: `--transition-${path.join('-')}`,
      value: value,
      variant,
      isTheme
    };
  }

    processKeyframes(path, value, variant, isTheme) {
    // Remove redundant "keyframes" from path
    if (path[0] === 'keyframes') {
      path = path.slice(1);
    }

    // For keyframes, we need to generate both the @keyframes rule and the animation custom property
    const keyframeName = path.join('-');

    // Convert keyframes object to CSS
    let keyframesCSS = `@keyframes ${keyframeName} {\n`;

    for (const [percentage, styles] of Object.entries(value)) {
      keyframesCSS += `  ${percentage} {\n`;

      for (const [property, styleValue] of Object.entries(styles)) {
        // Convert camelCase to kebab-case for CSS properties
        const cssProperty = toKebabCase(property);
        keyframesCSS += `    ${cssProperty}: ${styleValue};\n`;
      }

      keyframesCSS += `  }\n`;
    }

    keyframesCSS += `}`;

    // Return both the keyframes definition and the animation custom property
    return [
      {
        type: 'keyframes',
        name: keyframeName,
        value: keyframesCSS,
        variant,
        isTheme
      },
      {
        type: 'animation',
        name: `--animate-${keyframeName}`,
        value: `${keyframeName} 1s ease-in-out`,
        variant,
        isTheme
      }
    ];
  }

  /**
   * Find a token by its path in the dictionary
   * @param {object} dictionary
   * @param {string[]} path
   * @returns {object|null}
   */
  findTokenByPath(dictionary, path) {
    if (!dictionary || !dictionary.allTokens) return null;
    
    return dictionary.allTokens.find(token => {
      const tokenPath = token.path.join('.');
      const searchPath = path.join('.');
      return tokenPath === searchPath;
    });
  }
}