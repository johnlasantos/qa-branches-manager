
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const distDir = path.resolve(__dirname, 'dist');
const publicDir = path.resolve(distDir, 'public');
const apiDir = path.resolve(__dirname, 'api');

console.log('🚀 Starting unified build process...');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
  console.log('📁 Created dist directory');
}

try {
  // 1. Build the frontend
  console.log('🛠️ Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend built successfully!');

  // 2. Copy server.js to dist
  console.log('📋 Copying backend files...');
  fs.copyFileSync(
    path.resolve(apiDir, 'server.js'),
    path.resolve(distDir, 'server.js')
  );
  console.log('✅ server.js copied to dist folder');

  // 3. Copy config.json to dist
  fs.copyFileSync(
    path.resolve(apiDir, 'config.json'),
    path.resolve(distDir, 'config.json')
  );
  console.log('✅ config.json copied to dist folder');

  // 4. Create a package.json in the dist folder for backend dependencies
  const apiPackageJSON = require(path.resolve(apiDir, 'package.json'));
  const distPackageJSON = {
    name: apiPackageJSON.name,
    version: apiPackageJSON.version,
    description: "Unified build of Git Branch Manager",
    scripts: {
      start: "node server.js"
    },
    dependencies: apiPackageJSON.dependencies,
    engines: apiPackageJSON.engines
  };

  fs.writeFileSync(
    path.resolve(distDir, 'package.json'),
    JSON.stringify(distPackageJSON, null, 2)
  );
  console.log('✅ package.json created in dist folder');

  console.log('🎉 Build process completed successfully!');
  console.log('');
  console.log('To run the application:');
  console.log('1. Navigate to the dist directory: cd dist');
  console.log('2. Install dependencies: npm install');
  console.log('3. Start the server: npm start or node server.js');
} catch (error) {
  console.error('❌ Build process failed:', error);
  process.exit(1);
}
