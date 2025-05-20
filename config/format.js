import StyleDictionary from 'style-dictionary';

/**
 * Checks if a token is a theme token.
 * @param {string} tokenName
 * @returns {boolean}
 */
function isThemeToken(tokenName) {
  return typeof tokenName === 'string' && tokenName.includes("theme-content");
}

/**
 * Gets the theme variant from a token name.
 * @param {string} tokenName
 * @param {string} [rootPropertyName="_"]
 * @returns {string|null}
 */
function getThemeVariant(tokenName, rootPropertyName = "_") {
  const parts = tokenName.split("-");
  const variant = parts[parts.length - 1];
  return variant === "content" || variant === rootPropertyName ? null : variant;
}

/**
 * Normalizes the theme token name by removing the variant suffix if needed.
 * @param {string} tokenName
 * @param {string} [rootPropertyName="_"]
 * @returns {string}
 */
function normalizeThemeTokenName(tokenName, rootPropertyName = "_") {
  if (isThemeToken(tokenName)) {
    const parts = tokenName.split("-");
    const lastPart = parts[parts.length - 1];
    if (lastPart === rootPropertyName || (lastPart !== "content" && lastPart !== rootPropertyName)) {
      return parts.slice(0, -1).join("-");
    }
  }
  return tokenName;
}

/**
 * Creates a color variable object from a token.
 * @param {object} token
 * @param {string} [rootPropertyName="_"]
 * @returns {{name: string, value: string, variant: string|null}}
 */
function createColorVariable(token, rootPropertyName = "_") {
  if (!token || typeof token.name !== 'string') return { name: '', value: '', variant: null };
  const value = token.$value ?? token.value;
  const isTheme = isThemeToken(token.name);
  const normalizedName = normalizeThemeTokenName(token.name, rootPropertyName);
  const variant = isTheme ? getThemeVariant(token.name, rootPropertyName) : null;
  return {
    name: `--color-${normalizedName}`,
    value,
    variant,
  };
}

/**
 * Template helpers for CSS output
 */
const css = {
  indent: (str, level = 1) => str.split('\n').map(line => line ? '  '.repeat(level) + line : '').join('\n'),
  block: (content, level = 1) => `{
${css.indent(content, level)}
}`,
  rule: (selector, content) => `${selector} {
${css.indent(content, 1)}
}`,
  property: (name, value) => `${name}: ${value};`,
  import: (path) => `@import '${path}';`,
  theme: (content) => `@theme ${css.block(content, 1)}`,
  layer: (name, content) => `@layer ${name} ${css.block(content, 1)}`,
  utility: (name, content) => `@utility ${name} ${css.block(content, 1)}`,
  customVariant: (name, selector) => `@custom-variant ${name} (${selector});`,
  join: (arr, separator = '\n') => arr.filter(Boolean).join(separator)
};

/**
 * Creates a utility directive string from a token.
 * @param {object} token
 * @returns {{name: string, properties: string}}
 */
function createUtilityDirective(token) {
  if (!token || typeof token.name !== 'string' || typeof token.$value !== 'object') return { name: '', properties: '' };
  const value = token.$value ?? token.value;
  const name = token.name.replace(/^sd\./, "").replace(/\./g, "-");
  const properties = Object.entries(value)
    .map(([key, val]) => {
      if (typeof val === "object" && "$value" in val) {
        return css.property(key, val.$value)
      }
      return css.property(key, val)
    })
    .join("\n");
  return {
    name,
    properties: css.utility(name, properties)
  };
}

/**
 * Creates a spacing variable from a token.
 * @param {object} token
 * @returns {{name: string, value: string}}
 */
function createSpacingVariable(token) {
  if (!token || typeof token.name !== 'string') return { name: '', value: '' };
  const value = token.$value ?? token.value;
  const name = token.name.replace(/^sd\./, "").replace(/\./g, "-");
  return {
    name: `--spacing-${name}`,
    value,
  };
}

/**
 * Creates a composition variable from a token.
 * @param {object} token
 * @returns {{name: string, value: string}}
 */
function createCompositionVariable(token) {
  if (!token || typeof token.name !== 'string' || typeof token.$value !== 'object') {
    return { name: '', value: '' };
  }

  const value = token.$value;
  const name = token.name.replace(/^sd\./, "").replace(/\./g, "-");

  // Convert each property in the composition to a CSS custom property
  const properties = Object.entries(value)
    .map(([key, val]) => {
      // Convert camelCase to kebab-case for CSS properties
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();

      // Use the transformed value from Style Dictionary
      const finalValue = typeof val === 'object' ? val.$value : val;

      return css.property(`--${name}-${cssKey}`, finalValue);
    })
    .join('\n');

  return {
    name,
    properties
  };
}

/**
 * Processes all tokens and groups them by type.
 * @param {object} dictionary
 * @param {string} [rootPropertyName="_"]
 * @returns {{baseVars: string[], themeVars: Map<string, string[]>, utilityDirectives: string[], spacingVariables: string[], compositionVariables: string[]}}
 */
function processTokens(dictionary, rootPropertyName = "_") {
  const themeVars = new Map();
  const baseVars = [];
  const utilityDirectives = [];
  const spacingVariables = [];
  const compositionVariables = [];

  if (!dictionary || !Array.isArray(dictionary.allTokens)) {
    return { baseVars, themeVars, utilityDirectives, spacingVariables, compositionVariables };
  }

  for (const token of dictionary.allTokens) {
    if (!token || typeof token.$type !== 'string') continue;

    if (token.$type === "color") {
      const { name, value, variant } = createColorVariable(token, rootPropertyName);
      if (!name) continue;
      const varString = css.property(name, value);
      if (variant) {
        const arr = themeVars.get(variant) || [];
        arr.push(varString);
        themeVars.set(variant, arr);
      } else {
        baseVars.push(varString);
      }
    } else if (token.$type === "utility") {
      const utility = createUtilityDirective(token);
      if (utility.properties) utilityDirectives.push(utility.properties);
    } else if (token.$type === "dimension") {
      const spacing = createSpacingVariable(token);
      if (spacing.name) spacingVariables.push(css.property(spacing.name, spacing.value));
    } else if (token.$type === "composition") {
      const composition = createCompositionVariable(token);
      if (composition.properties) compositionVariables.push(composition.properties);
    }
  }

  return { baseVars, themeVars, utilityDirectives, spacingVariables, compositionVariables };
}

/**
 * Main Style Dictionary format plugin for Tailwind v4 tokens.
 * @param {object} param0
 * @param {object} param0.dictionary
 * @param {object} [param0.options]
 * @returns {string}
 */
export function cssVarsPlugin({ dictionary, options = {} }) {
  const {
    rootPropertyName = "_",
    generateCustomVariants = false,
    themeSelector = "data"
  } = options;
  const themeSelectorType = typeof themeSelector === "string" ? themeSelector : themeSelector.type;
  const themeSelectorProperty = typeof themeSelector === "string" ? "theme" : themeSelector.property || "theme";
  const { baseVars, themeVars, utilityDirectives, spacingVariables, compositionVariables } = processTokens(dictionary, rootPropertyName);

  function getThemeSelector(variant) {
    return themeSelectorType === "class"
      ? `.${variant}`
      : `[data-${themeSelectorProperty}="${variant}"]`;
  }

  const hasTheme = themeVars.size > 0;

  // Generate theme layers
  const themeLayers = [
    css.theme(css.join([...baseVars, ...spacingVariables, ...compositionVariables], '\n')),
    hasTheme
      ? css.layer('base', css.join(
          Array.from(themeVars.entries()).map(([variant, vars]) =>
            css.rule(getThemeSelector(variant), css.join(vars, '\n'))
          ),
          '\n\n'
        ))
      : null
  ].filter(Boolean);

  // Generate custom variants
  const customVariants = generateCustomVariants
    ? Array.from(themeVars.keys()).map((variant) =>
        themeSelectorType === "class"
          ? css.customVariant(variant, `&:where(.${variant}, .${variant} *)`)
          : css.customVariant(variant, `&:where([data-${themeSelectorProperty}=${variant}], [data-${themeSelectorProperty}=${variant}] *)`)
      )
    : [];

  // Combine all parts with proper spacing to match test expectations
  const parts = [
    css.import('tailwindcss'),
    customVariants.length ? css.join(customVariants, '\n') : null,
    css.join(themeLayers, '\n\n'),
    utilityDirectives.length ? css.join(utilityDirectives, '\n\n') : null
  ].filter(Boolean);

  // Match the exact format expected by the tests
  return parts.join('\n\n') + '\n';
}
