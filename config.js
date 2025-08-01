import StyleDictionary from "style-dictionary";
import { createTailwindV4Plugin } from "./dist/index.js";
import { register } from "@tokens-studio/sd-transforms";
import { registerCustomTransforms, registerTransformGroup } from "./dist/transforms.js";

// Register Tokens Studio transforms
register(StyleDictionary);

// Register our custom transforms and transform group
registerCustomTransforms(StyleDictionary);
registerTransformGroup(StyleDictionary);

// Register the new modular Tailwind v4 plugin with minimal configuration
// All the common settings are now defaults, but can be overridden as needed
StyleDictionary.registerFormat({
  name: "tailwind-v4",
  format: createTailwindV4Plugin({
    // Custom configuration can be added here to override defaults
    // For example, to customize theme selectors:
    // themeSelectors: {
    //   light: ':root',
    //   dark: '.dark',
    //   brand: '[data-theme="brand"]'
    // },

    // Or to disable certain features:
    // componentHandling: {
    //   enabled: false
    // }
  })
});

// Main configuration
export default {
  source: ["./tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    // CSS output using the new plugin
    css: {
      buildPath: "dist/",
      transformGroup: "tokens-studio",
      transforms: ['name/utility-kebab'],
      files: [
        {
          destination: "design-system.css",
          format: "tailwind-v4"
        },
      ],
    },

    // Demo output (for backward compatibility)
    demo: {
      buildPath: "demo/",
      transformGroup: "tokens-studio",
      transforms: ['name/utility-kebab'],
      files: [
        {
          destination: "global.css",
          format: "tailwind-v4"
        },
      ],
    },
  },
};