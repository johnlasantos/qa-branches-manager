const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const distDir = path.resolve(__dirname, 'dist');
const managerDir = path.resolve(distDir, 'manager');
const apiDir = path.resolve(__dirname, 'api');

console.log('🚀 Starting unified build process...');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
  console.log('📁 Created dist directory');
}

try {
  // 1. Build the frontend (now outputs to dist/manager)
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

  // 3. Copy nssm.exe to dist
  fs.copyFileSync(
    path.resolve(apiDir, 'nssm.exe'),
    path.resolve(distDir, 'nssm.exe')
  );
  console.log('✅ nssm.exe copied to dist folder');

  // 4. Copy config.json to dist - now with the correct .json extension
  fs.copyFileSync(
    path.resolve(apiDir, 'config.json'),
    path.resolve(distDir, 'config.json')
  );
  console.log('✅ config.json copied to dist folder');

  // 5. Create a package.json in the dist folder for backend dependencies
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

  // 6. Create index.html for redirection
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="refresh" content="0; url=manager/" />
  <title>Redirecting...</title>
</head>
<body>
  Redirecting...
</body>
</html>`;

  fs.writeFileSync(
    path.resolve(distDir, 'index.html'),
    indexHtmlContent
  );
  console.log('✅ index.html created in dist folder');

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
