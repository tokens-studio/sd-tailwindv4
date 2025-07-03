/**
 * CSS template helpers for clean output generation
 */
export class CSSBuilder {
  constructor(config = {}) {
    this.config = config;
    this.indentSize = config.indentSize || 2;
  }

  /**
   * Indent text by specified levels
   * @param {string} str
   * @param {number} level
   * @returns {string}
   */
  indent(str, level = 1) {
    return str
      .split('\n')
      .map(line => line ? ' '.repeat(this.indentSize * level) + line : '')
      .join('\n');
  }

  /**
   * Create a CSS block
   * @param {string} content
   * @param {number} level
   * @returns {string}
   */
  block(content, level = 1) {
    return `{\n${this.indent(content, level)}\n}`;
  }

  /**
   * Create a CSS rule
   * @param {string} selector
   * @param {string} content
   * @returns {string}
   */
  rule(selector, content) {
    return `${selector} {\n${this.indent(content, 1)}\n}`;
  }

  /**
   * Create a CSS property
   * @param {string} name
   * @param {string} value
   * @returns {string}
   */
  property(name, value) {
    return `${name}: ${value};`;
  }

  /**
   * Create an import statement
   * @param {string} path
   * @returns {string}
   */
  import(path) {
    return `@import '${path}';`;
  }

  /**
   * Create a @theme directive
   * @param {string} content
   * @returns {string}
   */
  theme(content) {
    return `@theme ${this.block(content, 1)}`;
  }

  /**
   * Create a @layer directive
   * @param {string} name
   * @param {string} content
   * @returns {string}
   */
  layer(name, content) {
    return `@layer ${name} ${this.block(content, 1)}`;
  }

  /**
   * Create a @utility directive
   * @param {string} name
   * @param {string} content
   * @returns {string}
   */
  utility(name, content) {
    return `@utility ${name} ${this.block(content, 1)}`;
  }

  /**
   * Create a @custom-variant directive
   * @param {string} name
   * @param {string} selector
   * @returns {string}
   */
  customVariant(name, selector) {
    return `@custom-variant ${name} (${selector});`;
  }

  /**
   * Join array elements with separator, filtering out falsy values
   * @param {Array} arr
   * @param {string} separator
   * @returns {string}
   */
  join(arr, separator = '\n') {
    return arr.filter(Boolean).join(separator);
  }
}

/**
 * Specialized CSS output generator for Tailwind v4
 */
export class TailwindCSSGenerator {
  constructor(config) {
    // Handle both PluginConfiguration object and raw config object
    this.configObj = config;
    this.config = config.getAll ? config.getAll() : config;
    this.css = new CSSBuilder(this.config);
  }

  /**
   * Generate complete CSS output
   * @param {object} processedTokens
   * @returns {string}
   */
  generate(processedTokens) {
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
   * @returns {string|null}
   */
  generateImport() {
    return this.config.includeImport
      ? this.css.import(this.config.importPath)
      : null;
  }

  /**
   * Generate custom variants
   * @param {Map} themeVars
   * @returns {string|null}
   */
  generateCustomVariants(themeVars) {
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
   * @param {object} processedTokens
   * @returns {string}
   */
  generateTheme(processedTokens) {
    const themeVars = [
      ...processedTokens.baseVars,
      ...processedTokens.spacing
    ];

    return this.css.theme(this.css.join(themeVars, '\n'));
  }

  /**
   * Generate @layer directives
   * @param {object} processedTokens
   * @returns {string|null}
   */
  generateLayers(processedTokens) {
    const layers = [];

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
   * @param {Array} utilities
   * @returns {string|null}
   */
  generateUtilities(utilities) {
    return utilities.length > 0
      ? this.css.join(utilities, '\n\n')
      : null;
  }

  /**
   * Fallback method to create theme selector string
   * @param {string} variant
   * @returns {string}
   */
  getThemeSelector(variant) {
    const themeSelectorType = this.config.themeSelectorType || this.config.themeSelector || 'data';
    const themeSelectorProperty = this.config.themeSelectorProperty || 'theme';
    
    return themeSelectorType === 'class'
      ? `.${variant}`
      : `[data-${themeSelectorProperty}="${variant}"]`;
  }
}