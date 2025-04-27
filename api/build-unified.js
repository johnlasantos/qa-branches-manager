
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting unified build process...');

try {
  // Run the main build script
  execSync('node build.js', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  console.log('✅ Unified build completed successfully!');
} catch (error) {
  console.error('❌ Build process failed:', error);
  process.exit(1);
}
