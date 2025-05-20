import StyleDictionary from "style-dictionary";
import { cssVarsPlugin } from "./config/format.js";

import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

StyleDictionary.registerTransform({
  type: "value",
  name: "ts-tailwindv4/composition/px",
  transitive: true,
  matcher: function (token) {
    return token.$type === "composition" || token.$type === "utility";
  },
  transform: function (token) {
    if (token.$type === "utility" || token.$type === "composition") {
      Object.entries(token.$value).forEach(([_, val]) => {
        if (val.$type === "dimension" && !val.$value.endsWith("px")) {
          val.$value = val.$value + "px";
        }
      });
    }
    if (token.$type === "dimension" && !token.isSource) {
      return token.$value + "px";
    }
    return token.$value;
  },
});

StyleDictionary.registerFormat({
  name: "ts-tailwindv4/css-vars-plugin",
  format: cssVarsPlugin,
});

export default {
  source: ["./tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    tailwind: {
      buildPath: "demo",
      transformGroup: "tokens-studio",
      transforms: [
        "name/kebab",
        "color/hsl",
        "size/px",
        "ts-tailwindv4/composition/px",
      ],
      files: [
        {
          destination: "global.css",
          format: "ts-tailwindv4/css-vars-plugin",
          options: {
            rootPropertyName: "_",
            createComponentClasses: true,
            themeSelector: {
              type: "data",
              property: "theme",
            },
          },
        },
      ],
    },
  },
};
