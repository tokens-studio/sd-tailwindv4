import StyleDictionary from "style-dictionary";
import { createTailwindV4Plugin } from "./config/index.js";
import { register } from "@tokens-studio/sd-transforms";

// Register Tokens Studio transforms
register(StyleDictionary);

// Zero configuration (recommended)
StyleDictionary.registerFormat({
  name: "tailwind-v4",
  format: createTailwindV4Plugin()
});

// Custom configuration example
StyleDictionary.registerFormat({
  name: "tailwind-v4-custom",
  format: createTailwindV4Plugin({
    themeSelectors: {
      light: ':root',
      dark: '.dark'
    },
    componentHandling: {
      enabled: false
    }
  })
});

// Example 3: Minimal features
StyleDictionary.registerFormat({
  name: "tailwind-v4-minimal",
  format: createTailwindV4Plugin({
    componentHandling: { enabled: false },
    outputOptions: { showComments: false }
  })
});

// Example 4: Custom token type mappings
StyleDictionary.registerFormat({
  name: "tailwind-v4-custom-types",
  format: createTailwindV4Plugin({
    tokenTypeMapping: {
      // Add custom mappings (merges with defaults)
      'customType': 'spacing',
      'brandColor': 'color',

      // Override defaults if needed
      'fontSize': 'custom-typography'
    }
  })
});

// Example 5: Advanced customization
StyleDictionary.registerFormat({
  name: "tailwind-v4-advanced",
  format: createTailwindV4Plugin({
    themeSelectors: {
      light: ':root',
      dark: '.dark',
      'high-contrast': '[data-theme="high-contrast"]',
      print: '@media print'
    },
    customVariants: {
      // Add to defaults
      'focus-visible': '&:focus-visible',
      'peer-focus': '.peer:focus ~ &',

      // Override defaults
      'hover': '&:hover:not(:disabled)'
    },
    componentHandling: {
      enabled: true,
      generateUtilities: false,  // Don't create utility classes from components
      prefix: 'component-'       // Custom prefix
    },
    outputOptions: {
      showComments: true,
      formatCSS: true,
      groupByLayer: true
    }
  })
});

// Main configuration
export default {
  source: ["./tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      buildPath: "dist/",
      transformGroup: "tokens-studio",
      files: [{
        destination: "design-system.css",
        format: "tailwind-v4"
      }]
    },

    // Custom themed output
    themed: {
      buildPath: "dist/",
      transformGroup: "tokens-studio",
      files: [
        {
          destination: "design-system-themed.css",
          format: "tailwind-v4-custom"
        },
      ],
    },

    // Clean output without extras
    clean: {
      buildPath: "dist/",
      transformGroup: "tokens-studio",
      files: [
        {
          destination: "design-system-clean.css",
          format: "tailwind-v4-minimal"
        },
      ],
    },
  },
};