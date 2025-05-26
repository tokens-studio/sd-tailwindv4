import { PluginConfiguration } from './configuration.js';
import { TokenProcessingEngine } from './token-engine.js';
import { TailwindCSSGenerator } from './css-builder.js';

/**
 * Main Tailwind v4 Style Dictionary plugin
 */
export class TailwindV4Plugin {
  constructor(userConfig = {}) {
    this.config = new PluginConfiguration(userConfig);
    this.engine = new TokenProcessingEngine(this.config);
    this.generator = new TailwindCSSGenerator(this.config);
  }

  /**
   * Process dictionary and generate CSS output
   * @param {object} dictionary
   * @returns {string}
   */
  format(dictionary) {
    try {
      const processedTokens = this.engine.processTokens(dictionary);
      return this.generator.generate(processedTokens);
    } catch (error) {
      console.error('Error in TailwindV4Plugin.format:', error);
      throw error;
    }
  }
}

/**
 * Create a Tailwind v4 Style Dictionary plugin
 * @param {object} options - Configuration options (optional, uses defaults)
 * @returns {function} Style Dictionary format function
 */
export function createTailwindV4Plugin(options = {}) {
  const plugin = new TailwindV4Plugin(options);

  return function({ dictionary }) {
    return plugin.format(dictionary);
  };
}