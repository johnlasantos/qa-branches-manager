
# Git Branch Manager

![Git Branch Manager](https://img.shields.io/badge/Branch-Manager-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

A web application for managing Git branches across repositories with an easy-to-use interface.

## 📋 Overview

Git Branch Manager provides a straightforward interface to perform common Git branch operations:

- View local and remote branches
- Switch between branches
- Create branches from remote
- Delete local branches
- Clean up stale/deprecated branches
- Pull latest changes from remote

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/) installed and in your PATH
- Access to a Git repository that you want to manage

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd git-branch-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the unified package:
   ```bash
   node build.cjs
   ```

4. Navigate to the distribution directory and install dependencies:
   ```bash
   cd dist
   npm install
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Access the application:
   - Frontend: `http://localhost:3001/manager/`

## 🛠️ Development

For active development, you can run:

```bash
# In the project root:
npm run dev
```

This will start both:
- Frontend development server (Vite)
- Backend API server (ExpressJS)

## 📦 Project Structure

```
git-branch-manager/
├── api/                 # Backend API code
├── src/                 # Frontend React application
├── dist/                # Built application (after build.cjs)
│   ├── manager/         # Built frontend
│   ├── server.js        # Express server
│   └── config.json      # Configuration file
├── build.cjs            # Build script for unified package
└── vite.config.ts       # Vite configuration
```

## ⚙️ Configuration

The application uses a `config.json` file for runtime configuration. During build, a default config is generated with:

```json
{
  "repositoryPath": ".",
  "headerLink": "https://project.domain.com/",
  "basePath": "/",
  "apiBaseUrl": "https://api.domain.com/"
}
```

- **repositoryPath**: Path to the Git repository you want to manage
- **headerLink**: URL for the header link/branding
- **basePath**: Base URL path for the application
- **apiBaseUrl**: URL to the API endpoint

## 🔧 Production Deployment

### Manual Deployment

Deploy the application using a Node.js runtime:

1. Copy the `dist` directory to your server
2. Install dependencies with `npm install`
3. Update `config.json` with your specific configuration
4. Start the server with `node server.js` or use PM2 (see below)

### PM2 Deployment (Recommended)

For reliable production deployment, use PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name git-branch-manager

# Make it auto-start on system reboot
pm2 startup
pm2 save
```

### Windows Service (Using NSSM)

For Windows servers, you can set up a Windows service:

1. Use the included `nssm.exe` in the dist folder
2. Follow PM2 setup instructions in the API README

## 📚 Documentation

See the separate README files for more detailed information:

- [Frontend Documentation](src/README.md)
- [Backend API Documentation](api/README.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.
