import { ColorTokenProcessor } from './token-processors/color.js';
import { SpacingTokenProcessor } from './token-processors/spacing.js';
import { UtilityTokenProcessor } from './token-processors/utility.js';
import { TypographyTokenProcessor } from './token-processors/typography.js';
import { ShadowTokenProcessor } from './token-processors/shadow.js';
import { AnimationTokenProcessor } from './token-processors/animation.js';

/**
 * Token processing engine that orchestrates all token processors
 */
export class TokenProcessingEngine {
  constructor(config) {
    this.config = config;
    this.processors = new Map();
    this.registerDefaultProcessors();
  }

  /**
   * Register default token processors
   */
  registerDefaultProcessors() {
    this.registerProcessor('color', new ColorTokenProcessor(this.config.getAll()));
    this.registerProcessor('spacing', new SpacingTokenProcessor(this.config.getAll()));
    this.registerProcessor('utility', new UtilityTokenProcessor(this.config.getAll()));
    this.registerProcessor('typography', new TypographyTokenProcessor(this.config.getAll()));
    this.registerProcessor('shadow', new ShadowTokenProcessor(this.config.getAll()));
    this.registerProcessor('animation', new AnimationTokenProcessor(this.config.getAll()));
  }

  /**
   * Register a token processor
   * @param {string} name
   * @param {BaseTokenProcessor} processor
   */
  registerProcessor(name, processor) {
    this.processors.set(name, processor);
  }

  /**
   * Get all registered processors
   * @returns {Array}
   */
  getProcessors() {
    return Array.from(this.processors.values());
  }

  /**
   * Process all tokens using registered processors
   * @param {object} dictionary
   * @returns {object}
   */
  processTokens(dictionary) {
    const result = {
      baseVars: [],
      themeVars: new Map(),
      utilities: [],
      spacing: [],
      compositions: [],
      components: []
    };

    if (!dictionary?.allTokens || !Array.isArray(dictionary.allTokens)) {
      return result;
    }

    const processors = this.getProcessors();

    for (const token of dictionary.allTokens) {
      if (!token || typeof token.$type !== 'string') continue;

      // Find the first processor that can handle this token
      const processor = processors.find(p => p.canProcess(token));

      if (!processor) {
        console.warn(`No processor found for token type: ${token.$type}`, token.name);
        continue;
      }

      try {
        const processed = processor.process(token, dictionary);
        if (processed) {
          // Handle both single processed tokens and arrays (e.g., keyframes)
          if (Array.isArray(processed)) {
            processed.forEach(item => this.categorizeProcessedToken(item, result));
          } else {
            this.categorizeProcessedToken(processed, result);
          }
        }
      } catch (error) {
        console.error(`Error processing token ${token.name}:`, error);
      }
    }

    return result;
  }

  /**
   * Categorize processed token into appropriate result buckets
   * @param {object} processed
   * @param {object} result
   */
  categorizeProcessedToken(processed, result) {
    switch (processed.type) {
      case 'color':
        const varString = `${processed.name}: ${processed.value};`;
        if (processed.variant) {
          const arr = result.themeVars.get(processed.variant) || [];
          arr.push(varString);
          result.themeVars.set(processed.variant, arr);
        } else {
          result.baseVars.push(varString);
        }
        break;

      case 'spacing':
        const spacingVarString = `${processed.name}: ${processed.value};`;
        if (processed.variant) {
          const arr = result.themeVars.get(processed.variant) || [];
          arr.push(spacingVarString);
          result.themeVars.set(processed.variant, arr);
        } else {
          result.spacing.push(spacingVarString);
        }
        break;

      case 'typography':
        const typographyVarString = `${processed.name}: ${processed.value};`;
        if (processed.variant) {
          const arr = result.themeVars.get(processed.variant) || [];
          arr.push(typographyVarString);
          result.themeVars.set(processed.variant, arr);
        } else {
          result.baseVars.push(typographyVarString);
        }
        break;

      case 'shadow':
        const shadowVarString = `${processed.name}: ${processed.value};`;
        if (processed.variant) {
          const arr = result.themeVars.get(processed.variant) || [];
          arr.push(shadowVarString);
          result.themeVars.set(processed.variant, arr);
        } else {
          result.baseVars.push(shadowVarString);
        }
        break;

      case 'animation':
        const animationVarString = `${processed.name}: ${processed.value};`;
        if (processed.variant) {
          const arr = result.themeVars.get(processed.variant) || [];
          arr.push(animationVarString);
          result.themeVars.set(processed.variant, arr);
        } else {
          result.baseVars.push(animationVarString);
        }
        break;

      case 'keyframes':
        // Keyframes go in a special section for @keyframes rules
        result.baseVars.push(processed.value);
        break;

      case 'utility':
        if (processed.properties) {
          result.utilities.push(processed.properties);
        }
        break;

      case 'composition':
        if (processed.properties) {
          result.compositions.push(processed.properties);
        }
        if (processed.className && processed.cssProperties) {
          result.components.push(`${processed.className} {\n  ${processed.cssProperties}\n}`);
        }
        break;

      default:
        console.warn(`Unknown processed token type: ${processed.type}`);
    }
  }
}