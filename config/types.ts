/**
 * TypeScript interfaces and types for the Tailwind v4 configuration tool
 */

export interface ThemeSelectors {
  light: string;
  dark: string;
  system?: string;
  [key: string]: string | undefined;
}

export interface CustomVariants {
  [key: string]: string;
}

export interface ComponentHandling {
  enabled: boolean;
  generateUtilities: boolean;
  prefix: string;
}

export interface UtilityGeneration {
  enabled: boolean;
  prefix: string;
}

export interface OutputOptions {
  showComments: boolean;
  formatCSS: boolean;
  groupByLayer: boolean;
}

export interface TokenTypeMapping {
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  shadow: string;
  boxShadow: string;
  component: string;
  utility: string;
  composition: string;
  duration: string;
  cubicBezier: string;
  transition: string;
  keyframes: string;
  number: string;
  dimension: string;
  color: string;
  [key: string]: string;
}

export interface PluginConfig {
  rootPropertyName: string;
  themePattern: string;
  colorPrefix: string;
  spacingPrefix: string;
  themeSelectors: ThemeSelectors;
  customVariants: CustomVariants;
  componentHandling: ComponentHandling;
  utilityGeneration: UtilityGeneration;
  outputOptions: OutputOptions;
  tokenTypeMapping: TokenTypeMapping;
  themeSelector: string;
  generateCustomVariants: boolean;
  createComponentClasses: boolean;
  componentLayer: string;
  includeImport: boolean;
  importPath: string;
  tokenTypeMap: Record<string, string>;
  themeSelectorType?: string;
  themeSelectorProperty?: string;
  indentSize?: number;
}

export interface ThemeSelector {
  type: string;
  property: string;
}

export interface Token {
  name: string;
  $type: string;
  $value: any;
  path: string[];
  filePath: string;
  isSource: boolean;
  original: any;
  attributes?: Record<string, any>;
  [key: string]: any;
}

export interface Dictionary {
  allTokens: Token[];
  tokens: Record<string, any>;
  [key: string]: any;
}

export interface ProcessedToken {
  type: string;
  name: string;
  value?: string;
  variant?: string | null;
  properties?: string;
  isTheme?: boolean;
  className?: string;
  cssProperties?: string;
}

export interface ProcessedTokens {
  baseVars: string[];
  themeVars: Map<string, string[]>;
  utilities: string[];
  spacing: string[];
  compositions: string[];
  components: string[];
}

export interface CSSBuilderOptions {
  indentSize?: number;
}

export interface BaseTokenProcessor {
  canProcess(token: Token): boolean;
  process(token: Token, dictionary: Dictionary): ProcessedToken | ProcessedToken[] | null;
}

export interface TokenProcessorConfig extends PluginConfig {
  // Additional config specific to token processors
  shadowPrefix?: string;
  numberPrefix?: string;
  componentPrefix?: string;
}

export type ThemeSelectorType = 'class' | 'data';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface LayerConfig {
  base?: boolean;
  components?: boolean;
  utilities?: boolean;
}

export interface KeyframesConfig {
  enabled: boolean;
  prefix?: string;
}

export interface AnimationConfig {
  keyframes: KeyframesConfig;
  transitions: boolean;
  timing: boolean;
}

export interface ConfigValidator {
  validate(config: Partial<PluginConfig>): ValidationResult;
}

export interface TokenProcessor extends BaseTokenProcessor {
  readonly processorName: string;
  readonly supportedTypes: string[];
}

export interface ProcessorRegistry {
  register(name: string, processor: TokenProcessor): void;
  get(name: string): TokenProcessor | undefined;
  getAll(): TokenProcessor[];
  canProcess(tokenType: string): boolean;
}