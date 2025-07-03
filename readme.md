# Tailwind v4 TypeScript Configuration Tool

A powerful, type-safe design token pipeline that transforms JSON design tokens into Tailwind v4 CSS using Style Dictionary. Built with TypeScript for enhanced developer experience and robust configuration management.

## 🎯 Features

- **🔷 TypeScript-First**: Fully typed configuration with IntelliSense support
- **⚡ Fast Builds**: Optimized compilation and token processing
- **🎨 Theme Support**: Advanced theming with automatic dark/light mode
- **🧩 Component Tokens**: Pre-built component styles and utilities
- **🔧 Extensible**: Custom processors, transforms, and configurations
- **📦 Modular Architecture**: Clean separation between source and runtime

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Build & Run

```bash
# Full build (TypeScript + tokens)
npm run build

# Start development server
npm run dev

# Build tokens only
npm run build-tokens
```

## 📁 Project Structure

```
├── config/                 # TypeScript source files
│   ├── types.ts            # Type definitions
│   ├── configuration.ts    # Main configuration class
│   ├── index.ts           # Plugin entry point
│   ├── css-builder.ts     # CSS generation utilities
│   ├── token-engine.ts    # Token processing engine
│   ├── transforms.ts      # Custom transforms
│   └── token-processors/  # Individual token processors
├── tokens/                # Design token JSON files
├── dist/                  # Compiled JavaScript (auto-generated)
├── demo/                  # Demo application
├── config.js             # Runtime configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Token Structure

This tool supports several unconventional but powerful token patterns:

### 1. Theme-Aware Tokens

Use the special `_` property for default values and named variants for themes:

```json
{
  "color": {
    "theme": {
      "content": {
        "_": { "$type": "color", "$value": "#000000" },
        "dark": { "$type": "color", "$value": "#ffffff" }
      },
      "background": {
        "_": { "$type": "color", "$value": "#ffffff" },
        "dark": { "$type": "color", "$value": "#000000" }
      }
    }
  }
}
```

**Generated CSS:**
```css
@theme {
  --color-theme-content: #000000;
  --color-theme-background: #ffffff;
}

@layer base {
  [data-theme="dark"] {
    --color-theme-content: #ffffff;
    --color-theme-background: #000000;
  }
}
```

### 2. Component Tokens

Define complete component styles with pseudo-states:

```json
{
  "component": {
    "button": {
      "primary": {
        "$type": "component",
        "$value": {
          "backgroundColor": "{color.brand.primary}",
          "color": "white",
          "padding": "{spacing.3} {spacing.6}",
          "borderRadius": "{radius.md}",
          "&:hover": {
            "backgroundColor": "{color.blue.600}",
            "transform": "translateY(-1px)"
          },
          "&:focus": {
            "outline": "2px solid {color.brand.primary}"
          }
        }
      }
    }
  }
}
```

**Generated CSS:**
```css
@layer components {
  .c-button-primary {
    background-color: var(--color-brand-primary);
    color: white;
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--radius-md);
  }
  
  .c-button-primary:hover {
    background-color: var(--color-blue-600);
    transform: translateY(-1px);
  }
  
  .c-button-primary:focus {
    outline: 2px solid var(--color-brand-primary);
  }
}
```

### 3. Utility Tokens

Create custom utility classes:

```json
{
  "utilities": {
    "flex-center": {
      "$type": "utility",
      "$value": {
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "center"
      }
    },
    "glass": {
      "$type": "utility",
      "$value": {
        "backgroundColor": "rgba(255, 255, 255, 0.1)",
        "backdropFilter": "blur(10px)",
        "border": "1px solid rgba(255, 255, 255, 0.2)"
      }
    }
  }
}
```

**Generated CSS:**
```css
@utility flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@utility glass {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 4. Composition Tokens

Similar to utilities but with enhanced processing:

```json
{
  "utilities": {
    "flex-center": {
      "$type": "composition",
      "$value": {
        "display": "flex",
        "alignItems": "center",
        "justifyContent": "center"
      }
    }
  }
}
```

### 5. Animation Tokens

Define keyframes and transitions:

```json
{
  "animation": {
    "fadeIn": {
      "$type": "keyframes",
      "$value": {
        "0%": { "opacity": "0" },
        "100%": { "opacity": "1" }
      }
    },
    "slideUp": {
      "$type": "transition",
      "$value": {
        "property": "transform",
        "duration": "{duration.fast}",
        "timingFunction": "{easing.ease-out}"
      }
    }
  }
}
```

## ⚙️ Configuration

### Basic Configuration (config.js)

```javascript
import { createTailwindV4Plugin } from "./dist/index.js";

StyleDictionary.registerFormat({
  name: "tailwind-v4",
  format: createTailwindV4Plugin({
    // Configuration options
  })
});
```

### Advanced Configuration Options

```javascript
createTailwindV4Plugin({
  // Theme Configuration
  themeSelectors: {
    light: ':root',
    dark: '[data-theme="dark"]',
    'high-contrast': '[data-theme="high-contrast"]'
  },

  // Component Handling
  componentHandling: {
    enabled: true,
    generateUtilities: true,  // Create utility classes from components
    prefix: 'c-'              // Component class prefix
  },

  // Utility Generation
  utilityGeneration: {
    enabled: true,
    prefix: 'u-'              // Utility class prefix
  },

  // Custom Variants
  customVariants: {
    'focus-visible': '&:focus-visible',
    'peer-focus': '.peer:focus ~ &',
    'group-hover': '.group:hover &'
  },

  // Token Type Mappings
  tokenTypeMapping: {
    'fontSize': 'typography',
    'fontWeight': 'typography',
    'shadow': 'shadow',
    'component': 'component',
    'utility': 'utility',
    'composition': 'composition'
  },

  // Output Options
  outputOptions: {
    showComments: true,       // Add comments to generated CSS
    formatCSS: true,          // Format output CSS
    groupByLayer: true        // Group by @layer directives
  }
})
```

## 🔧 TypeScript Development

### Type Safety

The configuration tool provides comprehensive TypeScript support:

```typescript
import type { PluginConfig, Token, ProcessedToken } from './config/types.js';

// Strongly typed configuration
const config: Partial<PluginConfig> = {
  themeSelectors: {
    light: ':root',
    dark: '.dark'
  },
  componentHandling: {
    enabled: true,
    generateUtilities: false
  }
};
```

### Custom Processors

Create custom token processors with full type support:

```typescript
import { BaseTokenProcessor } from './config/token-processors/base.js';
import type { Token, Dictionary, ProcessedToken } from './config/types.js';

export class CustomTokenProcessor extends BaseTokenProcessor {
  canProcess(token: Token): boolean {
    return token.$type === 'custom';
  }

  process(token: Token, dictionary: Dictionary): ProcessedToken | null {
    // Custom processing logic
    return {
      type: 'custom',
      name: `--custom-${token.name}`,
      value: token.$value
    };
  }
}
```

## 📝 Token File Conventions

### File Organization

Organize tokens by category:

```
tokens/
├── colors.json          # Color palette and theme colors
├── typography.json      # Font families, sizes, weights
├── spacing.json         # Spacing scale
├── radius.json          # Border radius values
├── shadows.json         # Box shadow definitions
├── animations.json      # Keyframes and transitions
├── components.json      # Component styles
├── utilities.json       # Custom utility classes
└── tokens.json          # Core design tokens
```

### Naming Conventions

- **Kebab-case**: All generated CSS uses kebab-case
- **Nested structure**: Use object nesting for logical grouping
- **Theme variants**: Use `_` for default, named keys for variants
- **Token references**: Use `{path.to.token}` syntax for references

### Special Properties

- **`$type`**: Required - defines the token type
- **`$value`**: Required - the token value
- **`$extensions`**: Optional - metadata and extensions
- **`_` key**: Special key for default theme values
- **Named keys**: Theme variant names (e.g., `dark`, `light`)

## 🎯 Token Types

| Type | Purpose | Output |
|------|---------|--------|
| `color` | Color values | CSS custom properties |
| `dimension` | Spacing, sizing | CSS custom properties |
| `fontFamily` | Font stacks | CSS custom properties |
| `fontSize` | Text sizes | CSS custom properties |
| `fontWeight` | Font weights | CSS custom properties |
| `lineHeight` | Line heights | CSS custom properties |
| `shadow` | Box shadows | CSS custom properties |
| `component` | Component styles | CSS classes |
| `utility` | Utility classes | @utility directives |
| `composition` | Complex utilities | @utility directives |
| `keyframes` | Animation keyframes | @keyframes rules |
| `transition` | Transitions | CSS custom properties |
| `number` | Numeric values | CSS custom properties |

## 🔄 Build Process

### Development Workflow

1. **Edit tokens**: Modify JSON files in `tokens/`
2. **Build**: Run `npm run build-tokens`
3. **Preview**: Use `npm run dev` to see changes
4. **Type check**: Run `npm run type-check`

### Production Build

```bash
# Complete build
npm run build

# Output files:
# dist/design-system.css - Main CSS output
# demo/global.css - Demo CSS
# dist/ - Compiled TypeScript
```

## 🎨 Generated CSS Structure

```css
@import 'tailwindcss';

/* Custom variants */
@custom-variant focus-visible (&:focus-visible);

/* Theme variables */
@theme {
  --color-brand-primary: oklch(0.570 0.191 248.32);
  --spacing-4: 1rem;
}

/* Theme variants */
@layer base {
  [data-theme="dark"] {
    --color-theme-background: #000000;
  }
}

/* Components */
@layer components {
  .c-button-primary {
    background-color: var(--color-brand-primary);
  }
}

/* Utilities */
@utility flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## 🚀 Examples

### Theme Switching

```html
<!-- Light theme (default) -->
<body>
  <div class="bg-theme-background text-theme-content">
    Light theme content
  </div>
</body>

<!-- Dark theme -->
<body data-theme="dark">
  <div class="bg-theme-background text-theme-content">
    Dark theme content
  </div>
</body>
```

### Component Usage

```html
<!-- Using generated component classes -->
<button class="c-button-primary">Primary Button</button>
<button class="c-button-secondary">Secondary Button</button>

<!-- Using utility classes -->
<div class="flex-center glass">Centered glass effect</div>
```

## 🔍 Troubleshooting

### Common Issues

1. **TypeScript errors**: Run `npm run type-check` to identify issues
2. **Build failures**: Ensure all JSON files are valid
3. **Missing tokens**: Check file paths and token references
4. **CSS not updating**: Run full rebuild with `npm run build`

### Debug Mode

Enable verbose logging:

```bash
npm run build-tokens -- --verbose
```

## 📚 Advanced Topics

### Custom Transforms

Define custom Style Dictionary transforms:

```typescript
export const customTransform = {
  name: 'custom/transform',
  type: 'value',
  matcher: (token: Token) => token.$type === 'custom',
  transform: (token: Token) => {
    // Transform logic
    return transformedValue;
  }
};
```

### Plugin Extensions

Extend the base plugin with custom processors:

```typescript
import { TokenProcessingEngine } from './config/token-engine.js';
import { CustomProcessor } from './custom-processor.js';

const engine = new TokenProcessingEngine(config);
engine.registerProcessor('custom', new CustomProcessor());
```

## 🎯 Key Differences & Unconventional Patterns

### 1. The `_` Default Pattern

**Unlike standard approaches**, this tool uses `_` as the key for default/base theme values:

```json
{
  "color": {
    "theme": {
      "background": {
        "_": { "$type": "color", "$value": "#fff" },    // ← Default value
        "dark": { "$type": "color", "$value": "#000" }  // ← Theme variant
      }
    }
  }
}
```

**Why?** This allows any token type to have theme variants, not just colors.

### 2. CamelCase in JSON, Kebab-case in CSS

**Token files use camelCase**, but **CSS output uses kebab-case**:

```json
{
  "backgroundColor": "blue",
  "alignItems": "center"
}
```

**Becomes:**
```css
background-color: blue;
align-items: center;
```

### 3. Component Pseudo-selectors

**Pseudo-selectors use `&` prefix** in component tokens:

```json
{
  "$value": {
    "color": "blue",
    "&:hover": { "color": "red" },
    "&:focus": { "outline": "2px solid blue" }
  }
}
```

### 4. Token References vs CSS Variables

**Use token references `{path.to.token}`**, not CSS variables:

```json
// ✅ Correct
{
  "padding": "{spacing.4} {spacing.6}",
  "color": "{color.brand.primary}"
}

// ❌ Incorrect  
{
  "padding": "var(--spacing-4) var(--spacing-6)",
  "color": "var(--color-brand-primary)"
}
```

### 5. Multi-Type Theme Support

**Any token type can have themes**, not just colors:

```json
{
  "spacing": {
    "theme": {
      "gap": {
        "_": { "$type": "dimension", "$value": "1rem" },
        "compact": { "$type": "dimension", "$value": "0.5rem" }
      }
    }
  }
}
```

### 6. Composition vs Utility Types

- **`utility`**: Basic utility class generation
- **`composition`**: Enhanced processing with additional features

Both create `@utility` directives but with different processing pipelines.

## 📄 License

ISC License - Feel free to use in your projects!

---

**Built with ❤️ using TypeScript, Style Dictionary, and Tailwind CSS v4**