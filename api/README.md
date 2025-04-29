# Git Branch Manager - Backend API

![Node.js](https://img.shields.io/badge/Node.js-14+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![PM2](https://img.shields.io/badge/PM2-Supported-blue)

API backend for Git Branch Manager, providing Git operations through a clean REST API.

---

## 📋 What It Does

- List local and remote branches
- Switch branches
- Delete local branches
- Clean up stale branches
- Pull updates
- Serve the frontend in production

---

## 🚀 Getting Started

### Requirements

- [Node.js](https://nodejs.org/) (v14+)
- [Git](https://git-scm.com/) installed and in PATH
- A Git repository to manage

### Setup

```bash
# Go to API folder
cd api

# Install dependencies
npm install

# Start development server
npm run dev
```

API available at: [http://localhost:3001/](http://localhost:3001/)

---

## 📦 API Endpoints

| Endpoint | Method | Description |
|:---------|:------|:------------|
| `/config` | GET | Get config info |
| `/branches` | GET | List local branches (paginated) |
| `/remote-branches` | GET | List remote branches (paginated) |
| `/remote-branches/search` | GET | Search remote branches |
| `/checkout` | POST | Switch to branch |
| `/delete-branch` | POST | Delete a branch |
| `/pull` | POST | Pull latest changes |
| `/cleanup` | POST | Clean stale branches |
| `/status` | GET | Get repo status |

### Pagination

Use `page` and `limit` query parameters:

```bash
GET /branches?page=0&limit=20
```

---

## ⚙️ Configuration

Edit `config.json`:

```json
{
  "repositoryPath": "/path/to/git/repo",
  "headerLink": "https://project.domain.com/",
  "basePath": "/",
  "apiBaseUrl": "https://api.domain.com/"
}
```

Only `repositoryPath` is required.

---

## 🔧 Deploying in Production

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name branches-manager-api
pm2 save
pm2 startup
```

Optionally set environment variables:

```bash
pm2 start server.js --name branches-manager-api --env production
```

### Windows Service with NSSM

1. Use included `nssm.exe`
2. Set up NSSM to run `pm2 resurrect`
3. Configure user and PM2_HOME variable
4. Start the service

---

## 📤 Unified Build

Create production-ready package:

```bash
node build.cjs
```

Will generate the `dist/` folder with:

- Frontend build
- Backend server
- Config file
- NSSM executable (for Windows services)
- Package dependencies

---

## 🔍 Troubleshooting

- **Git errors**: Check if Git is installed and available in PATH
- **Invalid repository**: Verify `repositoryPath` points to a real repo
- **Permission issues**: Node.js must have access rights
- **NSSM problems**: Check PM2_HOME setup

Useful commands:

```bash
pm2 logs branches-manager-api
pm2 restart branches-manager-api
pm2 stop branches-manager-api
pm2 status
```

---

## 🛠️ Error Handling

- Git command errors are logged and returned as clean error responses
- 400 for invalid requests
- 500 for server errors (details hidden in production)

---