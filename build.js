#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔨 Building TypeScript configuration tool...');
console.log('');

// Build TypeScript files
console.log('📦 Compiling TypeScript...');
execSync('npm run build-ts', { stdio: 'inherit' });
console.log('✅ TypeScript compilation complete!');
console.log('');

// Build design tokens
console.log('🎨 Building design tokens...');
execSync('style-dictionary build --config ./config.js --verbose', { stdio: 'inherit' });
console.log('✅ Token build complete!');
console.log('');

console.log('🚀 Build successful! Generated files:');
console.log('  📄 dist/design-system.css - Main design system output');
console.log('  📄 demo/global.css - Demo output'); 
console.log('  📁 dist/ - Compiled TypeScript configuration');
console.log('');
console.log('💡 To run the demo: npm run dev');
console.log('🔧 To rebuild: npm run build-tokens');