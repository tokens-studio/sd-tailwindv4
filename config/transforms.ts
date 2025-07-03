/**
 * Custom Style Dictionary transforms for Tailwind v4 plugin
 * These transforms replace custom logic in token processors with standardized SD transforms
 */
import type { Token } from './types.js';

interface Transform {
  name: string;
  type: string;
  matcher?: (token: Token) => boolean;
  transform: (token: Token) => any;
}

interface TransformGroup {
  name: string;
  transforms: string[];
}

/**
 * Transform to convert any string to kebab-case
 * Replaces the custom toKebabCase function used throughout processors
 */
export const nameKebabTransform: Transform = {
  name: "name/kebab-case",
  type: "name",
  transform: (token: Token) => {
    return token.path
      .map((part) => part.replace(/([A-Z])/g, "-$1").toLowerCase())
      .join("-");
  },
};

/**
 * Transform specifically for utility class names
 * Ensures consistent kebab-case naming for @utility directives
 */
export const utilityNameTransform: Transform = {
  name: "name/utility-kebab",
  type: "name",
  matcher: (token: Token) => {
    return ["utility", "composition"].includes(token.$type);
  },
  transform: (token: Token) => {
    // Remove common prefixes and convert to kebab-case
    let path = [...token.path];

    // Remove 'utilities' prefix if present
    if (path[0] === "utilities") {
      path = path.slice(1);
    }

    // Convert each part to kebab-case
    const kebabPath = path.map(
      (part) =>
        part
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()
          .replace(/^-/, "") // Remove leading dash
    );

    return kebabPath.join("-");
  },
};

/**
 * Transform to convert pixel values to rem
 * Useful for consistent sizing across the design system
 */
export const sizeRemTransform: Transform = {
  name: "size/rem",
  type: "value",
  matcher: (token: Token) => {
    return ["dimension", "sizing", "spacing", "fontSize"].includes(token.$type);
  },
  transform: (token: Token) => {
    const value = token.$value;
    if (typeof value === "string" && value.endsWith("px")) {
      const pixelValue = parseFloat(value);
      return `${pixelValue / 16}rem`;
    }
    return value;
  },
};

/**
 * Transform to ensure color values are in a consistent format
 * Converts various color formats to a standardized CSS format
 */
export const colorCssTransform: Transform = {
  name: "color/css-format",
  type: "value",
  matcher: (token: Token) => token.$type === "color",
  transform: (token: Token) => {
    const value = token.$value;
    // If it's already a proper CSS color format, return as-is
    if (typeof value === "string") {
      return value;
    }
    // Handle object color formats (e.g., from Tokens Studio)
    if (typeof value === "object" && value !== null) {
      // This would need to be enhanced based on your specific color object format
      return value.toString();
    }
    return value;
  },
};

/**
 * Transform to handle z-index values
 * Ensures z-index values are properly formatted
 */
export const zIndexTransform: Transform = {
  name: "zindex/number",
  type: "value",
  matcher: (token: Token) => {
    return (
      token.$type === "number" &&
      (token.path.includes("zIndex") ||
        token.path.includes("z-index") ||
        token.path.some((p) => p.toLowerCase().includes("zindex")))
    );
  },
  transform: (token: Token) => {
    const value = token.$value;
    if (value === "auto") return "auto";
    return parseInt(value, 10);
  },
};

/**
 * Transform to handle letter spacing values
 * Ensures consistent em units for letter spacing
 */
export const letterSpacingTransform: Transform = {
  name: "letterSpacing/em",
  type: "value",
  matcher: (token: Token) => {
    return (
      token.$type === "letterSpacing" ||
      (token.$type === "dimension" &&
        typeof token.name === "string" &&
        token.name.includes("tracking"))
    );
  },
  transform: (token: Token) => {
    const value = token.$value;
    if (typeof value === "string" && value.endsWith("em")) {
      return value;
    }
    if (typeof value === "number") {
      return `${value}em`;
    }
    return value;
  },
};

/**
 * Transform to handle font weight values
 * Ensures font weights are numbers or valid CSS keywords
 */
export const fontWeightTransform: Transform = {
  name: "fontWeight/number",
  type: "value",
  matcher: (token: Token) => token.$type === "fontWeight",
  transform: (token: Token) => {
    const value = token.$value;
    const weightMap = {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    };

    if (typeof value === "string" && weightMap[value.toLowerCase()]) {
      return weightMap[value.toLowerCase()];
    }

    return value;
  },
};

/**
 * Transform to handle duration values
 * Ensures consistent millisecond format
 */
export const durationTransform: Transform = {
  name: "duration/ms",
  type: "value",
  matcher: (token: Token) => token.$type === "duration",
  transform: (token: Token) => {
    const value = token.$value;
    if (typeof value === "string" && value.endsWith("ms")) {
      return value;
    }
    if (typeof value === "number") {
      return `${value}ms`;
    }
    return value;
  },
};

/**
 * Transform to normalize CSS property names for utilities
 * Converts camelCase to kebab-case for CSS properties
 */
export const cssPropertyTransform: Transform = {
  name: "css/property-kebab",
  type: "value",
  matcher: (token: Token) => {
    return (
      ["utility", "composition", "component"].includes(token.$type) &&
      typeof token.$value === "object"
    );
  },
  transform: (token: Token) => {
    const value = token.$value;
    if (typeof value !== "object") return value;

    const transformedValue = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("&")) {
        // Handle pseudo-selectors
        transformedValue[key] = val;
      } else {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        transformedValue[kebabKey] = val;
      }
    }
    return transformedValue;
  },
};

/**
 * Collection of all custom transforms
 */
export const customTransforms: Transform[] = [
  nameKebabTransform,
  utilityNameTransform,
  sizeRemTransform,
  colorCssTransform,
  zIndexTransform,
  letterSpacingTransform,
  fontWeightTransform,
  durationTransform,
  cssPropertyTransform,
];

/**
 * Register all custom transforms with Style Dictionary
 */
export function registerCustomTransforms(StyleDictionary: any): void {
  customTransforms.forEach((transform) => {
    StyleDictionary.registerTransform(transform);
  });
}

/**
 * Custom transform group that combines tokens-studio transforms with our custom ones
 */
export const tailwindTransformGroup: TransformGroup = {
  name: "tailwind-v4",
  transforms: [
    // Tokens Studio transforms (commonly available)
    "ts/resolveMath",
    "ts/color/css/hexrgba",
    "ts/size/px",

    // Our custom transforms
    "name/utility-kebab", // This will apply to utility/composition tokens
    "name/kebab-case", // This will apply to other tokens
    "zindex/number",
    "letterSpacing/em",
    "fontWeight/number",
    "duration/ms",
  ],
};

/**
 * Register the custom transform group
 */
export function registerTransformGroup(StyleDictionary: any): void {
  StyleDictionary.registerTransformGroup(tailwindTransformGroup);
}
