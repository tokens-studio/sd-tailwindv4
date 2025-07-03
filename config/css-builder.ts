import type { CSSBuilderOptions, ProcessedTokens } from './types.js';

/**
 * CSS template helpers for clean output generation
 */
export class CSSBuilder {
  private config: CSSBuilderOptions;
  private indentSize: number;

  constructor(config: CSSBuilderOptions = {}) {
    this.config = config;
    this.indentSize = config.indentSize || 2;
  }

  /**
   * Indent text by specified levels
   */
  indent(str: string, level: number = 1): string {
    return str
      .split('\n')
      .map(line => line ? ' '.repeat(this.indentSize * level) + line : '')
      .join('\n');
  }

  /**
   * Create a CSS block
   */
  block(content: string, level: number = 1): string {
    return `{\n${this.indent(content, level)}\n}`;
  }

  /**
   * Create a CSS rule
   */
  rule(selector: string, content: string): string {
    return `${selector} {\n${this.indent(content, 1)}\n}`;
  }

  /**
   * Create a CSS property
   */
  property(name: string, value: string): string {
    return `${name}: ${value};`;
  }

  /**
   * Create an import statement
   */
  import(path: string): string {
    return `@import '${path}';`;
  }

  /**
   * Create a @theme directive
   */
  theme(content: string): string {
    return `@theme ${this.block(content, 1)}`;
  }

  /**
   * Create a @layer directive
   */
  layer(name: string, content: string): string {
    return `@layer ${name} ${this.block(content, 1)}`;
  }

  /**
   * Create a @utility directive
   */
  utility(name: string, content: string): string {
    return `@utility ${name} ${this.block(content, 1)}`;
  }

  /**
   * Create a @custom-variant directive
   */
  customVariant(name: string, selector: string): string {
    return `@custom-variant ${name} (${selector});`;
  }

  /**
   * Join array elements with separator, filtering out falsy values
   */
  join(arr: any[], separator: string = '\n'): string {
    return arr.filter(Boolean).join(separator);
  }
}

/**
 * Specialized CSS output generator for Tailwind v4
 */
export class TailwindCSSGenerator {
  private configObj: any;
  private config: any;
  private css: CSSBuilder;

  constructor(config: any) {
    // Handle both PluginConfiguration object and raw config object
    this.configObj = config;
    this.config = config.getAll ? config.getAll() : config;
    this.css = new CSSBuilder(this.config);
  }

  /**
   * Generate complete CSS output
   */
  generate(processedTokens: ProcessedTokens): string {
    const parts = [
      this.generateImport(),
      this.generateCustomVariants(processedTokens.themeVars),
      this.generateTheme(processedTokens),
      this.generateLayers(processedTokens),
      this.generateUtilities(processedTokens.utilities)
    ].filter(Boolean);

    return parts.join('\n\n') + '\n';
  }

  /**
   * Generate import statement
   */
  generateImport(): string | null {
    return this.config.includeImport
      ? this.css.import(this.config.importPath)
      : null;
  }

  /**
   * Generate custom variants
   */
  generateCustomVariants(themeVars: Map<string, string[]>): string | null {
    if (!this.config.generateCustomVariants || !themeVars.size) {
      return null;
    }

    const variants = Array.from(themeVars.keys()).map(variant => {
      const selector = this.config.themeSelectorType === 'class'
        ? `&:where(.${variant}, .${variant} *)`
        : `&:where([data-${this.config.themeSelectorProperty}=${variant}], [data-${this.config.themeSelectorProperty}=${variant}] *)`;

      return this.css.customVariant(variant, selector);
    });

    return this.css.join(variants, '\n');
  }

  /**
   * Generate @theme directive
   */
  generateTheme(processedTokens: ProcessedTokens): string {
    const themeVars = [
      ...processedTokens.baseVars,
      ...processedTokens.spacing
    ];

    return this.css.theme(this.css.join(themeVars, '\n'));
  }

  /**
   * Generate @layer directives
   */
  generateLayers(processedTokens: ProcessedTokens): string | null {
    const layers: string[] = [];

    // Base layer for theme variants
    if (processedTokens.themeVars.size > 0) {
      const themeRules = Array.from(processedTokens.themeVars.entries())
        .map(([variant, vars]) => {
          const selector = this.configObj.getThemeSelector ? this.configObj.getThemeSelector(variant) : this.getThemeSelector(variant);
          return this.css.rule(selector, this.css.join(vars, '\n'));
        });

      layers.push(this.css.layer('base', this.css.join(themeRules, '\n\n')));
    }

    // Components layer
    if (this.config.createComponentClasses && processedTokens.components.length > 0) {
      layers.push(this.css.layer(
        this.config.componentLayer,
        this.css.join(processedTokens.components, '\n\n')
      ));
    }

    return layers.length > 0 ? this.css.join(layers, '\n\n') : null;
  }

  /**
   * Generate utility directives
   */
  generateUtilities(utilities: string[]): string | null {
    return utilities.length > 0
      ? this.css.join(utilities, '\n\n')
      : null;
  }

  /**
   * Fallback method to create theme selector string
   */
  getThemeSelector(variant: string): string {
    const themeSelectorType = this.config.themeSelectorType || this.config.themeSelector || 'data';
    const themeSelectorProperty = this.config.themeSelectorProperty || 'theme';
    
    return themeSelectorType === 'class'
      ? `.${variant}`
      : `[data-${themeSelectorProperty}="${variant}"]`;
  }
}