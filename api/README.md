
# Git Branch Manager - Backend API

![Node.js](https://img.shields.io/badge/Node.js-14+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![PM2](https://img.shields.io/badge/PM2-Supported-blue)

The backend API for Git Branch Manager, providing Git operations through a RESTful interface.

## 📋 Overview

This Express.js application provides API endpoints to:

- List local and remote Git branches
- Checkout branches
- Delete branches
- Clean up stale branches
- Pull latest changes from remote repositories
- Serve the frontend application in production mode

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/) installed and in your PATH
- Access to a Git repository that you want to manage

### Development Setup

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The API will be available at:
   ```
   http://localhost:3001/
   ```

## 📦 API Endpoints

| Endpoint | Method | Description |
|:---|:---|:---|
| `/config` | GET | Get API configuration |
| `/branches` | GET | List local branches with pagination |
| `/remote-branches` | GET | List remote branches with pagination |
| `/remote-branches/search` | GET | Search remote branches |
| `/checkout` | POST | Switch to a branch |
| `/delete-branch` | POST | Delete a local branch |
| `/pull` | POST | Pull latest changes for current branch |
| `/cleanup` | POST | Remove stale local branches |
| `/status` | GET | Get Git repository status |

### Pagination

Branch endpoints support pagination with query parameters:
- `page`: Page number (default: 0)
- `limit`: Items per page (default: 10)

Example:
```
GET /branches?page=0&limit=20
```

## ⚙️ Configuration

The API uses a `config.json` file in the project root with the following structure:

```json
{
  "repositoryPath": "/path/to/your/git/repository",
  "headerLink": "https://project.domain.com/",
  "basePath": "/",
  "apiBaseUrl": "https://api.domain.com/"
}
```

- **repositoryPath**: Path to the Git repository to manage (required)
- Other fields are primarily for frontend configuration

## 🔧 Production Deployment

### Using PM2 (Recommended)

PM2 is recommended for production deployment to ensure reliability and automatic restarts:

```bash
# Install PM2 globally
npm install -g pm2

# Start the API server
pm2 start server.js --name branches-manager-api

# Save the PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

### PM2 Environment Variables

If needed, set environment variables for PM2:

```bash
pm2 start server.js --name branches-manager-api --env production
```

### Windows Service with NSSM

For Windows servers, you can use NSSM to run the API as a service:

1. Use the included `nssm.exe`:
   ```bash
   nssm install branches-manager-api
   ```

2. In the NSSM configuration UI:
   - **Application Path**: Path to your `pm2.cmd` (e.g., `C:\Users\Administrator\AppData\Roaming\npm\pm2.cmd`)
   - **Arguments**: `resurrect`
   - **Startup Directory**: Folder containing `pm2.cmd` or project folder
   - **Log On**: Set to user account that has Git access
   - **Environment**: Add `PM2_HOME` variable pointing to PM2 home directory

3. Start the service:
   ```bash
   nssm start branches-manager-api
   ```

## 📤 Unified Build

The project includes a `build.cjs` script that creates a unified distribution package:

1. Run from the project root:
   ```bash
   node build.cjs
   ```

2. The distribution package will be created in the `dist` folder with:
   - Built frontend (`manager` directory)
   - Backend server (`server.js`)
   - Configuration file (`config.json`)
   - NSSM executable for Windows service setup (`nssm.exe`)
   - Package dependencies (`package.json`)

## 🔍 Troubleshooting

### Common Issues

- **Git Command Failures**: Ensure Git is installed and in the PATH of the system running the API
- **Repository Path Not Found**: Check the `repositoryPath` in `config.json` points to a valid Git repository
- **Permission Issues**: Ensure the Node.js process has permissions to access the Git repository
- **Windows Service Not Starting**: Verify PM2_HOME environment variable in NSSM configuration

### Command Reference

Useful commands for managing the API:

```bash
# View API logs
pm2 logs branches-manager-api

# Restart API
pm2 restart branches-manager-api

# Stop API
pm2 stop branches-manager-api

# Check process status
pm2 status
```

## 🛠️ Error Handling

The API includes error handling for Git operations:

- Git command failures are logged and returned as error responses
- Invalid requests return appropriate 400-level status codes
- Server errors return 500-level status codes with error messages

In production, detailed error information is restricted to avoid exposing sensitive details.
