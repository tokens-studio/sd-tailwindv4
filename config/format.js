function tokenFilter(token) {
  const utilities = new Set();
  const typography = new Set();
  const dimensions = new Set();
  const colors = new Set();

  switch (token.$type) {
    case "color":
      const colorName = token.name.replace(/^sd\./, "");
      colors.add(`color-${colorName}`);
      break;

    case "utility":
    // Filter out utilities and create custom tailwind utility classes for them.
    // Next step - identify the tokens that can be converted to functional utilities.
    // https://tailwindcss.com/docs/adding-custom-styles#functional-utilities
    case "typography":
    // Filter out typography tokens and create custom tailwind typography utility classes for them.
    case "dimension":
      // Filter out dimension tokens and create custom tailwind dimension utility classes for them.
      // Next step - identify the tokens that can be converted to functional utilities and create a new functional utility class
      break;
  }

  return [...utilities, ...typography, ...dimensions, ...colors];
}

function createUtility(token) {}

function isThemeToken(tokenName) {
  return tokenName.includes("theme-content");
}

function getThemeVariant(tokenName, rootPropertyName = "_") {
  const parts = tokenName.split("-");
  // Only consider the last part as a variant if it's not 'content'
  const variant = parts[parts.length - 1];
  return variant === "content"
    ? null
    : variant === rootPropertyName
      ? null
      : variant;
}

function normalizeThemeTokenName(tokenName, rootPropertyName = "_") {
  if (isThemeToken(tokenName)) {
    const parts = tokenName.split("-");
    const lastPart = parts[parts.length - 1];
    if (
      lastPart === rootPropertyName ||
      (lastPart !== "content" && lastPart !== rootPropertyName)
    ) {
      return parts.slice(0, -1).join("-");
    }
  }
  return tokenName;
}

function createColorVariable(token, rootPropertyName = "_") {
  const value = token?.$value || token?.value;
  const isTheme = isThemeToken(token.name);
  const normalizedName = normalizeThemeTokenName(token.name, rootPropertyName);
  const variant = isTheme ? getThemeVariant(token.name, rootPropertyName) : null;

  return {
    name: `--color-${normalizedName}`,
    value,
    variant,
  };
}

function createUtilityDirective(token) {
  const value = token?.$value || token?.value;
  const name = token.name.replace(/^sd\./, "").replace(/\./g, "-");

  // Convert the value object into CSS properties
  const properties = Object.entries(value)
    .map(([key, val]) => `  ${key}: ${val};`)
    .join("\n");

  return {
    name,
    properties: `@utility ${name} {\n${properties}\n}`
  };
}

function processTokens(dictionary, rootPropertyName = "_") {
  const themeVars = new Map(); // Map to store variables by theme variant
  const baseVars = []; // Array for base theme variables
  const utilityDirectives = []; // Array for utility directives

  dictionary.allTokens.forEach((token) => {
    if (token.$type === "color") {
      const { name, value, variant } = createColorVariable(
        token,
        rootPropertyName
      );
      const varString = `${name}: ${value};`;

      if (variant) {
        // Group by theme variant
        if (!themeVars.has(variant)) {
          themeVars.set(variant, []);
        }
        themeVars.get(variant).push(varString);
      } else {
        // Regular variables and underscore variants go in base theme
        baseVars.push(varString);
      }
    } else if (token.$type === "utility") {
      const utility = createUtilityDirective(token);
      utilityDirectives.push(utility.properties);
    }
  });

  return { baseVars, themeVars, utilityDirectives };
}

export function cssVarsPlugin({ dictionary, options = {} }) {
  const rootPropertyName = options.rootPropertyName || "_";
  const generateCustomVariants = options.generateCustomVariants ?? false;

  // Handle theme selector configuration
  const themeSelectorConfig = options.themeSelector || 'data';
  const themeSelectorType = typeof themeSelectorConfig === 'string'
    ? themeSelectorConfig
    : themeSelectorConfig.type;
  const themeSelectorProperty = typeof themeSelectorConfig === 'string'
    ? 'theme'
    : themeSelectorConfig.property || 'theme';

  const { baseVars, themeVars, utilityDirectives } = processTokens(dictionary, rootPropertyName);

  // Helper to generate the selector for a theme
  function getThemeSelector(variant) {
    if (themeSelectorType === 'class') {
      return `.${variant}`;
    } else {
      return `[data-${themeSelectorProperty}="${variant}"]`;
    }
  }

  // Generate theme layers
  const themeLayers = [
    `@theme {\n  ${baseVars.join("\n  ")}\n}`,
    ...Array.from(themeVars.entries()).map(
      ([variant, vars]) =>
        `@layer base {\n  ${getThemeSelector(variant)} {\n    ${vars.join("\n    ")}\n  }\n}`
    ),
  ];

  // Generate custom variants for each theme if enabled
  const customVariants = generateCustomVariants
    ? Array.from(themeVars.keys()).map(
        (variant) =>
          themeSelectorType === 'class'
            ? `@custom-variant ${variant} (&:where(.${variant}, .${variant} *));`
            : `@custom-variant ${variant} (&:where([data-${themeSelectorProperty}=${variant}], [data-${themeSelectorProperty}=${variant}] *));`
      )
    : [];

  // Combine all parts
  const parts = [
    `@import 'tailwindcss';`,
    themeLayers.join("\n\n"),
    utilityDirectives.length ? utilityDirectives.join("\n\n") : null,
    customVariants.length ? customVariants.join("\n") : null
  ].filter(Boolean);

  return parts.join("\n\n") + "\n";
}
