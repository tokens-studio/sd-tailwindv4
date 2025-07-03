import { PluginConfiguration } from './configuration.js';
import { TokenProcessingEngine } from './token-engine.js';
import { TailwindCSSGenerator } from './css-builder.js';
import type { PluginConfig, Dictionary } from './types.js';

/**
 * Main Tailwind v4 Style Dictionary plugin
 */
export class TailwindV4Plugin {
  private config: PluginConfiguration;
  private engine: TokenProcessingEngine;
  private generator: TailwindCSSGenerator;

  constructor(userConfig: Partial<PluginConfig> = {}) {
    this.config = new PluginConfiguration(userConfig);
    this.engine = new TokenProcessingEngine(this.config);
    this.generator = new TailwindCSSGenerator(this.config);
  }

  /**
   * Process dictionary and generate CSS output
   */
  format(dictionary: Dictionary): string {
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
 */
export function createTailwindV4Plugin(options: Partial<PluginConfig> = {}) {
  const plugin = new TailwindV4Plugin(options);

  return function({ dictionary }: { dictionary: Dictionary }): string {
    return plugin.format(dictionary);
  };
}