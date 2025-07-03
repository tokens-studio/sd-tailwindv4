import { BaseTokenProcessor } from './base.js';
import { objectToCssProperties, createUtilityClassName } from './utils.js';
import type { Token, Dictionary, ProcessedToken, TokenProcessorConfig } from '../types.js';

/**
 * Processor for component tokens
 * Handles tokens of type 'component' and generates CSS classes
 */
export class ComponentTokenProcessor extends BaseTokenProcessor {
  private componentPrefix: string;
  private generateClasses: boolean;

  constructor(options: TokenProcessorConfig = {} as TokenProcessorConfig) {
    super(options);
    this.componentPrefix = options.componentPrefix || 'c-';
    this.generateClasses = options.componentHandling?.enabled !== false;
  }

  canProcess(token: Token): boolean {
    return token.$type === 'component';
  }

  process(token: Token, dictionary: Dictionary): ProcessedToken | null {
    // Use the original token value to preserve token references
    const tokenValue = token.original?.$value || token.$value;
    if (!tokenValue || typeof tokenValue !== 'object') {
      return null;
    }

    const { finalPath, variant, isTheme } = this.processTokenPath(token);
    const kebabPath = this.pathToKebabCase(finalPath);
    const className = createUtilityClassName(this.componentPrefix, kebabPath);

    // Convert object properties to CSS with token reference conversion
    const cssProperties = this.objectToCssPropertiesWithVars(tokenValue, dictionary, 0);

    // Create CSS class definition
    const cssClass = `.${className} {\n${cssProperties}\n}`;

    return {
      type: 'component',
      name: className,
      value: cssClass,
      className: `.${className}`,
      cssProperties: cssProperties.replace(/\n/g, '\n  '), // Indent for nested use
      variant: variant,
      isTheme: isTheme
    };
  }

  /**
   * Convert object to CSS properties with token references converted to CSS custom properties
   */
  objectToCssPropertiesWithVars(obj: Record<string, any>, dictionary: Dictionary, indentLevel: number = 0): string {
    const indent = '  '.repeat(indentLevel);
    const properties: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('&')) {
        // Handle pseudo-selectors and nested rules
        const nestedProperties = this.objectToCssPropertiesWithVars(value, dictionary, indentLevel + 1);
        properties.push(`${indent}${String(key)} {\n${nestedProperties}\n${indent}}`);
      } else {
        // Convert camelCase to kebab-case for CSS properties
        const cssProperty = this.camelToKebab(key);
        const cssValue = this.convertTokenReferenceToVar(value, dictionary);
        properties.push(`${indent}${cssProperty}: ${String(cssValue)};`);
      }
    }

    return properties.join('\n');
  }

  /**
   * Convert token reference to CSS custom property reference
   */
  convertTokenReferenceToVar(value: any, dictionary: Dictionary): string {
    if (typeof value !== 'string') {
      return value;
    }

    // Handle values with multiple token references (e.g., "{spacing.3} {spacing.6}")
    if (value.includes(' ')) {
      return value.split(' ').map(part => this.convertTokenReferenceToVar(part.trim(), dictionary)).join(' ');
    }

    // If it's not a token reference, return as-is
    if (!value.startsWith('{') || !value.endsWith('}')) {
      return value;
    }

    // Extract the token path from the reference
    const tokenPath = value.slice(1, -1); // Remove { and }
    const pathParts = tokenPath.split('.');

    // Find the token in the dictionary to understand its type and generate the correct CSS variable name
    const referencedToken = this.findTokenByPath(dictionary, pathParts);
    
    if (referencedToken) {
      // Generate the CSS custom property name based on the token type and path
      return this.generateCssVarReference(referencedToken);
    }

    // Fallback: convert the path directly to a CSS variable
    return this.pathToCssVar(pathParts);
  }

  /**
   * Generate CSS custom property reference from a token
   */
  generateCssVarReference(token: Token): string {
    const { finalPath } = this.processTokenPath(token);
    let kebabPath = this.pathToKebabCase(finalPath);
    
    // Determine prefix based on token type
    let prefix = '';
    switch (token.$type) {
      case 'color':
        prefix = 'color';
        break;
      case 'dimension':
      case 'spacing':
      case 'sizing':
        // Check for special prefixes
        if (kebabPath.includes('radius')) prefix = 'radius';
        else if (kebabPath.includes('container')) prefix = 'container';
        else if (kebabPath.includes('breakpoint')) prefix = 'breakpoint';
        else prefix = 'spacing';
        break;
      case 'fontSize':
        prefix = 'text';
        break;
      case 'fontWeight':
        prefix = 'font-weight';
        // Special handling for font weight to avoid redundant prefixes
        if (kebabPath.includes('font') && kebabPath.includes('weight')) {
          // Remove the font and weight parts from the path
          kebabPath = kebabPath.filter(part => part !== 'font' && part !== 'weight');
        }
        break;
      case 'lineHeight':
        prefix = 'leading';
        break;
      case 'letterSpacing':
        prefix = 'tracking';
        break;
      case 'fontFamily':
        prefix = 'font';
        break;
      case 'shadow':
      case 'boxShadow':
        prefix = 'shadow';
        break;
      case 'duration':
        prefix = 'duration';
        break;
      case 'cubicBezier':
        prefix = 'ease';
        break;
      case 'transition':
        prefix = 'transition';
        break;
      case 'number':
        if (kebabPath.some(p => p.toLowerCase().includes('zindex'))) {
          prefix = 'z';
        } else {
          prefix = 'number';
        }
        break;
      default:
        prefix = token.$type || 'token';
    }

    // Remove redundant prefix from path
    const prefixKebab = this.toKebabCase(prefix);
    if (kebabPath[0] === prefixKebab) {
      kebabPath = kebabPath.slice(1);
    }

    return `var(--${prefix}-${kebabPath.join('-')})`;
  }

  /**
   * Convert path to CSS variable (fallback)
   */
  pathToCssVar(pathParts: string[]): string {
    const kebabPath = pathParts.map(part => this.toKebabCase(part));
    return `var(--${kebabPath.join('-')})`;
  }

  /**
   * Find a token by its path in the dictionary
   */
  findTokenByPath(dictionary: Dictionary, path: string[]): Token | null {
    if (!dictionary || !dictionary.allTokens) return null;
    
    return dictionary.allTokens.find(token => {
      const tokenPath = token.path.join('.');
      const searchPath = path.join('.');
      return tokenPath === searchPath;
    }) || null;
  }

  /**
   * Convert string to kebab-case
   */
  toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();
  }
}