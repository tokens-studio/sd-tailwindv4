# Tailwind v4 Style Dictionary Plugin

A **zero-configuration** Style Dictionary plugin that generates Tailwind v4-compatible CSS custom properties from design tokens.

## 🎯 Zero Configuration

Works out of the box with **no setup required**:

```javascript
import StyleDictionary from "style-dictionary";
import { createTailwindV4Plugin } from "./config/index.js";

StyleDictionary.registerFormat({
  name: "tailwind-v4",
  format: createTailwindV4Plugin()  // That's it!
});
```

## 🚀 Quick Start

```bash
npm install style-dictionary @tokens-studio/sd-transforms
```

**config.js:**
```javascript
import StyleDictionary from "style-dictionary";
import { createTailwindV4Plugin } from "./config/index.js";
import { register } from "@tokens-studio/sd-transforms";

register(StyleDictionary);

StyleDictionary.registerFormat({
  name: "tailwind-v4",
  format: createTailwindV4Plugin()
});

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
    }
  }
};
```

**Build:**
```bash
npx style-dictionary build --config config.js
```

## ✨ What You Get

**Automatic token processing for:**
- 🎨 Colors with theme variants (`light`/`dark`)
- 📐 Spacing, sizing, and layout tokens
- 🎬 Animation (duration, easing, transitions, keyframes)
- 🎯 Typography (fonts, weights, sizes)
- 🌟 Shadows and effects
- 📦 Component tokens
- 🔧 Custom utilities

**Smart defaults:**
- Theme selectors: `:root`, `[data-theme="dark"]`
- Interactive variants: `hover`, `focus`, `active`, `disabled`
- Component prefixes: `c-`
- Utility prefixes: `u-`
- Clean, formatted CSS output

## 🎨 Token Examples

**Colors with themes:**
```json
{
  "color": {
    "theme": {
      "background": {
        "_": { "$type": "color", "$value": "#ffffff" },
        "dark": { "$type": "color", "$value": "#000000" }
      }
    },
    "brand": {
      "primary": { "$type": "color", "$value": "#3b82f6" }
    }
  }
}
```

**Animations:**
```json
{
  "animation": {
    "duration": {
      "fast": { "$type": "duration", "$value": "150ms" }
    },
    "transition": {
      "all": {
        "$type": "transition",
        "$value": {
          "duration": "{animation.duration.fast}",
          "timingFunction": "ease",
          "property": "all"
        }
      }
    }
  }
}
```

**Components:**
```json
{
  "component": {
    "button": {
      "primary": {
        "$type": "component",
        "$value": {
          "backgroundColor": "{color.brand.primary}",
          "color": "white",
          "padding": "{spacing.3} {spacing.6}"
        }
      }
    }
  }
}
```

## 🎨 Global Theme Support

**Any token type** can have theme variants! The plugin automatically detects theme tokens and handles base values correctly:

```json
{
  "spacing": {
    "theme": {
      "gap": {
        "_": { "$type": "dimension", "$value": "1rem" },
        "compact": { "$type": "dimension", "$value": "0.5rem" }
      }
    }
  },
  "typography": {
    "theme": {
      "size": {
        "_": { "$type": "fontSize", "$value": "16px" },
        "large": { "$type": "fontSize", "$value": "18px" }
      }
    }
  }
}
```

**Output:**
```css
@theme {
  --spacing-theme-gap: 1rem;      /* Base value (no selector) */
  --text-theme-size: 16px;        /* Base value (no selector) */
}

[data-theme="compact"] {
  --spacing-theme-gap: 0.5rem;
}

[data-theme="large"] {
  --text-theme-size: 18px;
}
```

## 🔧 Customization (Optional)

Override any defaults:

```javascript
format: createTailwindV4Plugin({
  // Global theme configuration
  rootPropertyName: '_',          // Token name for base values (default: '_')
  themePattern: 'theme-content',  // Pattern to identify theme tokens

  // Theme selectors
  themeSelectors: {
    light: ':root',
    dark: '.dark'  // Use class instead of data attribute
  },

  // Feature toggles
  componentHandling: {
    enabled: false  // Disable component processing
  }
})
```

## 📤 Generated Output

Clean, Tailwind v4-compatible CSS:

```css
@theme {
  --color-brand-primary: #3b82f6;
  --spacing-3: 0.75rem;
  --duration-fast: 150ms;
}

[data-theme="dark"] {
  --color-theme-background: #000000;
}

@layer components {
  .c-button-primary {
    background-color: var(--color-brand-primary);
    color: white;
    padding: var(--spacing-3) var(--spacing-6);
  }
}
```

## 🎯 Key Features

- **Zero config** - Works immediately with sensible defaults
- **Fully customizable** - Override any setting when needed
- **Theme aware** - Automatic light/dark theme support
- **Token references** - Use `{token.path}` syntax, not CSS variables
- **Tailwind v4 optimized** - Proper `@theme`, `@layer`, `@utility` directives
- **Type safe** - Comprehensive token type mapping

---

**One export. Zero config. Just works.** ✨
