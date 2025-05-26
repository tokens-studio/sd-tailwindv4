#!/usr/bin/env node

import StyleDictionary from 'style-dictionary';
import config from './config.js';

console.log('🎨 Building design system with standardized config...');
console.log('📁 Source: tokens/**/*.json');
console.log('📄 Output: dist/design-system.css & demo/global.css');
console.log('');

// Build using the standardized config
const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();

console.log('✅ Build complete!');
console.log('');
console.log('🚀 Generated files:');
console.log('  📄 dist/design-system.css - Main design system output');
console.log('  📄 demo/global.css - Demo/legacy output');
console.log('');
console.log('💡 The config.js file is now the standardized reference for:');
console.log('  ✨ Custom utility classes');
console.log('  🎯 Component tokens');
console.log('  🎨 Theme-aware colors');
console.log('  📐 Layout tokens');
console.log('  🎬 Animation tokens');
console.log('  🔧 Advanced configuration options');