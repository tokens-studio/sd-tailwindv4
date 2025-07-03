import { BaseTokenProcessor } from './base.js';
import { toKebabCase } from './utils.js';
import type { Token, Dictionary, ProcessedToken, TokenProcessorConfig } from '../types.js';

interface TypeMapping {
  prefix: string;
  preserveUnit: boolean;
  defaultUnit: string | null;
}

/**
 * Processor for typography tokens with proper Tailwind CSS v4 naming
 * This processor adapts Style Dictionary tokens into Tailwind CSS variable names, avoiding double prefixes.
 */
export class TypographyTokenProcessor extends BaseTokenProcessor {
  private typeMappings: Record<string, TypeMapping>;

  constructor(options: TokenProcessorConfig = {} as TokenProcessorConfig) {
    super(options);

    // Define token type mappings to Tailwind CSS variable prefixes
    this.typeMappings = {
      fontSize: { prefix: 'text', preserveUnit: true, defaultUnit: 'rem' },
      fontWeight: { prefix: 'font-weight', preserveUnit: false, defaultUnit: null },
      lineHeight: { prefix: 'leading', preserveUnit: false, defaultUnit: null },
      letterSpacing: { prefix: 'tracking', preserveUnit: true, defaultUnit: 'em' },
      fontFamily: { prefix: 'font', preserveUnit: false, defaultUnit: null }
    };
  }

  canProcess(token: Token): boolean {
    // Handle standard typography token types
    if (['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontFamily'].includes(token.$type)) {
      return true;
    }
    
    // Handle dimension tokens that are actually letter spacing (tracking)
    if (token.$type === 'dimension' && token.name && token.name.includes('tracking')) {
      return true;
    }
    
    return false;
  }

  determineTokenType(token: Token): string {
    // Handle dimension tokens that are actually letter spacing
    if (token.$type === 'dimension' && token.name && token.name.includes('tracking')) {
      return 'letterSpacing';
    }
    return token.$type;
  }

  process(token: Token, dictionary: Dictionary): ProcessedToken | null {
    const value = this.getTokenValue(token);
    const tokenType = this.determineTokenType(token);
    const mapping = this.typeMappings[tokenType];
    if (!mapping) return null;

    // Use global theme processing logic
    const { finalPath, variant, isTheme } = this.processTokenPath(token);

    // Convert to kebab-case
    let path = this.pathToKebabCase(finalPath);
    const prefixKebab = toKebabCase(mapping.prefix);

    // Special handling for font weight tokens
    if (tokenType === 'fontWeight') {
      // For font weight tokens with path like ["font", "weight", "thin"]
      // We want to generate --font-weight-thin, not --font-weight-font-weight-thin
      if (path.length >= 3 && path[0] === 'font' && path[1] === 'weight') {
        // Remove the redundant "font" and "weight" parts, keep only the weight name
        path = path.slice(2);
      }
    }

    // Special handling for font family tokens
    if (tokenType === 'fontFamily') {
      // For font family tokens with path like ["font", "family", "sans"]
      // We want to generate --font-sans, not --font-font-family-sans
      if (path.length >= 3 && path[0] === 'font' && path[1] === 'family') {
        // Remove the redundant "font" and "family" parts, keep only the family name
        path = path.slice(2);
      }
    }

    // For other token types, remove redundant prefix if present
    if (tokenType !== 'fontWeight' && tokenType !== 'fontFamily') {
      if (path[0] === prefixKebab) {
        path = path.slice(1);
      }
    }

    // Process the value based on type requirements
    let processedValue = value;
    if (mapping.preserveUnit && typeof value === 'string') {
      // Keep the original value with its unit
      processedValue = value;
    } else if (typeof value === 'number' && mapping.defaultUnit) {
      // Add default unit if needed
      processedValue = `${value}${mapping.defaultUnit}`;
    }

    return {
      type: 'typography',
      name: `--${mapping.prefix}-${path.join('-')}`,
      value: processedValue,
      variant,
      isTheme
    };
  }
}