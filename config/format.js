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

function getThemeVariant(tokenName, baseDelimiter = "_") {
  const parts = tokenName.split("-");
  // Only consider the last part as a variant if it's not 'content'
  const variant = parts[parts.length - 1];
  return variant === "content"
    ? null
    : variant === baseDelimiter
      ? null
      : variant;
}

function normalizeThemeTokenName(tokenName, baseDelimiter = "_") {
  if (isThemeToken(tokenName)) {
    const parts = tokenName.split("-");
    const lastPart = parts[parts.length - 1];
    if (
      lastPart === baseDelimiter ||
      (lastPart !== "content" && lastPart !== baseDelimiter)
    ) {
      return parts.slice(0, -1).join("-");
    }
  }
  return tokenName;
}

function createColorVariable(token, baseDelimiter = "_") {
  const value = token?.$value || token?.value;
  const isTheme = isThemeToken(token.name);
  const normalizedName = normalizeThemeTokenName(token.name, baseDelimiter);
  const variant = isTheme ? getThemeVariant(token.name, baseDelimiter) : null;

  return {
    name: `--color-${normalizedName}`,
    value,
    variant,
  };
}

function processTokens(dictionary, baseDelimiter = "_") {
  const themeVars = new Map(); // Map to store variables by theme variant
  const baseVars = []; // Array for base theme variables

  dictionary.allTokens.forEach((token) => {
    if (token.$type === "color") {
      const { name, value, variant } = createColorVariable(
        token,
        baseDelimiter
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
    }
    // Add other token type processing here
  });

  return { baseVars, themeVars };
}

export function cssVarsPlugin({ dictionary, options = {} }) {
  const baseDelimiter = options.baseDelimiter || "_";
  const { baseVars, themeVars } = processTokens(dictionary, baseDelimiter);

  // Generate theme layers
  const themeLayers = [
    `@theme {\n  ${baseVars.join("\n  ")}\n}`,
    ...Array.from(themeVars.entries()).map(
      ([variant, vars]) =>
        `@layer base {\n  [data-theme="${variant}"] {\n    ${vars.join("\n    ")}\n  }\n}`
    ),
  ];

  return `@import 'tailwindcss';\n\n${themeLayers.join("\n\n")}\n`;
}
