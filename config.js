import StyleDictionary from "style-dictionary";
import { cssVarsPlugin } from "./config/format.js";

import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

StyleDictionary.registerTransform({
  type: "value",
  name: "ts-tailwindv4/handle-composition/px",
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
      transformGroup: "tokens-studio", // <-- apply the tokens-studio transformGroup to apply all transforms
      transforms: [
        "name/kebab",
        "color/hsl",
        "size/px",
        "ts-tailwindv4/handle-composition/px",
      ],
      files: [
        {
          destination: "global.css",
          format: "ts-tailwindv4/css-vars-plugin",
          options: {
            rootPropertyName: "_",
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

function createCompositionVariable(token) {
  if (
    !token ||
    typeof token.name !== "string" ||
    typeof token.$value !== "object"
  ) {
    return { name: "", value: "" };
  }

  const value = token.$value;
  const name = token.name.replace(/^sd\./, "").replace(/\./g, "-");

  const properties = Object.entries(value)
    .map(([key, val]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      // Output the value as-is, trusting transforms have already been applied
      let finalValue;
      if (val && typeof val === "object" && "$value" in val) {
        finalValue = val.$value;
      } else {
        finalValue = val;
      }
      return css.property(`--${name}-${cssKey}`, finalValue);
    })
    .join("\n");

  return {
    name,
    properties,
  };
}
