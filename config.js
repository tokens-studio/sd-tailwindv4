import StyleDictionary from "style-dictionary";
import { cssVarsPlugin } from "./config/format.js";

StyleDictionary.registerTransformGroup({
  name: "tailwind",
  transforms: ["name/kebab"],
});

StyleDictionary.registerFormat({
  name: "tailwindv4/css-vars-plugin",
  format: cssVarsPlugin
});

export default {
  source: ["./tokens/**/*.json"],
  platforms: {
    tailwind: {
      buildPath: "demo",
      transformGroup: "tailwind",
      files: [
        {
          destination: "global.css",
          format: "tailwindv4/css-vars-plugin",
          options: {
            rootPropertyName: '_',
            themeSelector: {
              type: 'data',
              property: 'theme'
            }
          }
        },
      ],
    },
  },
};
