import { describe, it, expect } from "vitest";
import { cssVarsPlugin } from "./format";
import { stripIndent } from "common-tags";

const normalize = (s) => s.trim().replace(/\r\n/g, "\n");

describe("format.js", () => {
  describe("cssVarsPlugin", () => {
    it("should handle basic color tokens", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-colors-surface",
            $type: "color",
            $value: "#00ff00",
          },
        ],
      };

      const result = cssVarsPlugin({ dictionary });

      expect(normalize(result)).toEqual(
        normalize(stripIndent`
        @import 'tailwindcss';

        @theme {
          --color-sd-colors-surface: #00ff00;
        }`)
      );
    });

    it("should handle theme tokens with default delimiter", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-theme-content-_",
            $type: "color",
            $value: "#000000",
          },
          {
            name: "sd-theme-content-dark",
            $type: "color",
            $value: "#ffffff",
          },
        ],
      };

      const result = cssVarsPlugin({ dictionary });

      expect(normalize(result)).toEqual(
        normalize(stripIndent`
        @import 'tailwindcss';

        @theme {
          --color-sd-theme-content: #000000;
        }

        @layer base {
          [data-theme="dark"] {
            --color-sd-theme-content: #ffffff;
          }
        }`)
      );
    });

    it("should handle custom base delimiter", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-theme-content-default",
            $type: "color",
            $value: "#000000",
          },
          {
            name: "sd-theme-content-dark",
            $type: "color",
            $value: "#ffffff",
          },
        ],
      };

      const result = cssVarsPlugin({
        dictionary,
        options: { rootPropertyName: "default" },
      });
      expect(normalize(result)).toEqual(
        normalize(stripIndent`
        @import 'tailwindcss';

        @theme {
          --color-sd-theme-content: #000000;
        }

        @layer base {
          [data-theme="dark"] {
            --color-sd-theme-content: #ffffff;
          }
        }`)
      );
    });

    it("should handle multiple theme variants", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-theme-content-_",
            $type: "color",
            $value: "#000000",
          },
          {
            name: "sd-theme-content-dark",
            $type: "color",
            $value: "#ffffff",
          },
          {
            name: "sd-theme-content-brand",
            $type: "color",
            $value: "#ff0000",
          },
        ],
      };

      const result = cssVarsPlugin({ dictionary });
      expect(normalize(result)).toEqual(
        normalize(stripIndent`
          @import 'tailwindcss';

          @theme {
            --color-sd-theme-content: #000000;
          }

          @layer base {
            [data-theme="dark"] {
              --color-sd-theme-content: #ffffff;
            }

            [data-theme="brand"] {
              --color-sd-theme-content: #ff0000;
            }
          }
        `)
      );
    });

    it("should handle non-color tokens", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-stack",
            $type: "utility",
            $value: {
              display: "flex",
              "flex-direction": "column",
            },
          },
        ],
      };

      const result = cssVarsPlugin({ dictionary });
      expect(result).not.toContain("--color-sd-stack");
    });

    it("should handle spacing tokens", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-spacing-base",
            $type: "dimension",
            $value: "1rem",
          },
        ],
      };

      const result = cssVarsPlugin({ dictionary });
      expect(normalize(result)).toEqual(
        normalize(stripIndent`
        @import 'tailwindcss';

        @theme {
          --spacing-sd-spacing-base: 1rem;
        }`)
      );
    });

    it("should handle multiple spacing tokens", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-spacing-base",
            $type: "dimension",
            $value: "1rem",
          },
          {
            name: "sd-spacing-large",
            $type: "dimension",
            $value: "2rem",
          },
        ],
      };

      const result = cssVarsPlugin({ dictionary });
      expect(normalize(result)).toEqual(
        normalize(stripIndent`
        @import 'tailwindcss';

        @theme {
          --spacing-sd-spacing-base: 1rem;
          --spacing-sd-spacing-large: 2rem;
        }`)
      );
    });

    it("should handle mixed token types", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-colors-surface",
            $type: "color",
            $value: "#00ff00",
          },
          {
            name: "sd-spacing-base",
            $type: "dimension",
            $value: "1rem",
          },
          {
            name: "sd-stack",
            $type: "utility",
            $value: {
              display: "flex",
              "flex-direction": "column",
            },
          },
        ],
      };

      const result = cssVarsPlugin({ dictionary });
      expect(normalize(result)).toEqual(
        normalize(stripIndent`
        @import 'tailwindcss';

        @theme {
          --color-sd-colors-surface: #00ff00;
          --spacing-sd-spacing-base: 1rem;
        }

        @utility sd-stack {
          display: flex;
          flex-direction: column;
        }`)
      );
    });

    it("should handle theme tokens with spacing tokens", () => {
      const dictionary = {
        allTokens: [
          {
            name: "sd-theme-content-_",
            $type: "color",
            $value: "#000000",
          },
          {
            name: "sd-theme-content-dark",
            $type: "color",
            $value: "#ffffff",
          },
          {
            name: "sd-spacing-base",
            $type: "dimension",
            $value: "1rem",
          },
        ],
      };

      const result = cssVarsPlugin({ dictionary });
      expect(normalize(result)).toEqual(
        normalize(stripIndent`
        @import 'tailwindcss';

        @theme {
          --color-sd-theme-content: #000000;
          --spacing-sd-spacing-base: 1rem;
        }

        @layer base {
          [data-theme="dark"] {
            --color-sd-theme-content: #ffffff;
          }
        }`)
      );
    });
  });
});
