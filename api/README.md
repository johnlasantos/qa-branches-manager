
# Git Branch Manager - Backend API

![Node.js](https://img.shields.io/badge/Node.js-14+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![PM2](https://img.shields.io/badge/PM2-Supported-blue)

API backend for Git Branch Manager, providing Git operations through a clean REST API.

---

## 📋 What It Does

- List local and remote branches with pagination
- Switch between branches
- Create branches from remote
- Delete local branches
- Clean up stale branches
- Pull updates from remote
- Sync with remote repository
- Track developer commits and activity
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

## 🔌 API Endpoints

### Configuration

#### GET `/config`

Get safe configuration values for the frontend.

**Request:**
```bash
curl -X GET http://localhost:3001/config
```

**Success Response:**
```json
{
  "headerLink": "http://127.0.0.1/scriptcase-git/",
  "apiBaseUrl": "http://127.0.0.1:3001/",
  "basePath": "/"
}
```

---

### Branch Management

#### GET `/branches`

List local branches with pagination support.

**Query Parameters:**
- `page` (number, optional): Page number (default: 0)
- `limit` (number, optional): Items per page (default: 10)
- `skipRefresh` (boolean, optional): Skip background refresh (default: false)

**Request:**
```bash
curl -X GET "http://localhost:3001/branches?page=0&limit=20"
```

**Success Response:**
```json
{
  "branches": [
    {
      "name": "main",
      "current": true,
      "isCurrent": true,
      "hasRemote": true
    },
    {
      "name": "feature-branch",
      "current": false,
      "isCurrent": false,
      "hasRemote": false
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 20,
    "total": 25,
    "hasMore": true
  }
}
```

#### GET `/remote-branches`

List remote branches with pagination support.

**Query Parameters:**
- `page` (number, optional): Page number (default: 0)
- `limit` (number, optional): Items per page (default: 10)
- `skipRefresh` (boolean, optional): Skip background refresh (default: false)

**Request:**
```bash
curl -X GET "http://localhost:3001/remote-branches?page=0&limit=10"
```

**Success Response:**
```json
{
  "branches": [
    {
      "name": "main"
    },
    {
      "name": "develop"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 10,
    "total": 15,
    "hasMore": true
  }
}
```

#### GET `/remote-branches/search`

Search remote branches by name with pagination.

**Query Parameters:**
- `q` (string, optional): Search query
- `page` (number, optional): Page number (default: 0)
- `limit` (number, optional): Items per page (default: 10)

**Request:**
```bash
curl -X GET "http://localhost:3001/remote-branches/search?q=feature&page=0&limit=10"
```

**Success Response:**
```json
{
  "branches": [
    {
      "name": "feature-login"
    },
    {
      "name": "feature-dashboard"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 10,
    "total": 5,
    "hasMore": false
  }
}
```

#### POST `/checkout`

Switch to a different branch. Creates from remote if branch doesn't exist locally.

**Request Body:**
- `branch` (string, required): Branch name to switch to

**Request:**
```bash
curl -X POST http://localhost:3001/checkout \
  -H "Content-Type: application/json" \
  -d '{"branch": "feature-branch"}'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Switched to branch 'feature-branch'",
  "stdout": "Switched to branch 'feature-branch'",
  "stderr": ""
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Branch 'nonexistent' not found locally or remotely",
  "stdout": "",
  "stderr": "Branch 'nonexistent' not found locally or remotely"
}
```

#### POST `/delete-branch`

Delete a local branch.

**Request Body:**
- `branch` (string, required): Branch name to delete

**Request:**
```bash
curl -X POST http://localhost:3001/delete-branch \
  -H "Content-Type: application/json" \
  -d '{"branch": "old-feature"}'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Deleted branch old-feature",
  "stdout": "Deleted branch old-feature",
  "stderr": ""
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Cannot delete the current branch",
  "stdout": "",
  "stderr": "Cannot delete the current branch"
}
```

#### POST `/pull`

Pull latest changes for the current branch.

**Request:**
```bash
curl -X POST http://localhost:3001/pull
```

**Success Response:**
```json
{
  "success": true,
  "message": "Already up to date.",
  "stdout": "Already up to date.",
  "stderr": ""
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Your local changes would be overwritten by merge",
  "stdout": "",
  "stderr": "Your local changes would be overwritten by merge",
  "code": 1
}
```

#### POST `/cleanup`

Clean up stale local branches that don't have remote tracking branches.

**Request:**
```bash
curl -X POST http://localhost:3001/cleanup
```

**Success Response:**
```json
{
  "success": true,
  "message": "Deleted branch old-feature\nDeleted branch temp-branch\n2 deprecated branches removed.",
  "stdout": "Deleted branch old-feature\nDeleted branch temp-branch\n2 deprecated branches removed.",
  "stderr": ""
}
```

**No Branches Response:**
```json
{
  "success": true,
  "message": "No deprecated branches to remove."
}
```

#### GET `/status`

Get the current repository status.

**Request:**
```bash
curl -X GET http://localhost:3001/status
```

**Success Response:**
```json
{
  "success": true,
  "status": " M src/components/example.tsx\n?? newfile.txt",
  "stdout": " M src/components/example.tsx\n?? newfile.txt",
  "stderr": ""
}
```

#### POST `/update-all-branches`

Update all local branches that have remote tracking branches.

**Request:**
```bash
curl -X POST http://localhost:3001/update-all-branches
```

**Success Response:**
```json
{
  "success": true,
  "overallSuccess": true,
  "results": [
    {
      "branch": "main",
      "success": true,
      "output": "Already up to date."
    },
    {
      "branch": "develop",
      "success": true,
      "output": "Fast-forward merge completed"
    }
  ]
}
```

---

### Repository Sync

#### POST `/sync`

Synchronizes the repository with the remote by running `git fetch --prune`.

**Request:**
```bash
curl -X POST http://localhost:3001/sync
```

**Success Response:**
```json
{
  "success": "Repository synchronized successfully.",
  "stdout": "From origin\n * [new branch] feature-x -> origin/feature-x",
  "stderr": ""
}
```

**Error Response:**
```json
{
  "error": "Failed to sync with remote repository.",
  "details": "fatal: unable to connect to remote"
}
```

---

### Developer Commits

#### POST `/commits`

Retrieves recent commits for a developer by email, including grouped emails for the same developer.

**Request Body:**
- `email` (string, required): Developer's email address

**Request:**
```bash
curl -X POST http://localhost:3001/commits \
  -H "Content-Type: application/json" \
  -d '{"email": "developer@example.com"}'
```

**Success Response:**
```json
{
  "last_commit": "2023-12-15 14:30:25",
  "previous_commit": "2023-12-14 09:15:10",
  "days_since_last_commit": 2,
  "days_between_commits": 1,
  "commits": [
    {
      "hash": "a1b2c3d4",
      "author": "John Developer",
      "email": "developer@example.com",
      "date": "2023-12-15 14:30:25",
      "message": "Fix authentication bug"
    },
    {
      "hash": "e5f6g7h8",
      "author": "John Developer", 
      "email": "developer@example.com",
      "date": "2023-12-14 09:15:10",
      "message": "Add user validation"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "No commits found for this user."
}
```

**Invalid Email Response:**
```json
{
  "error": "Invalid or missing \"email\" parameter."
}
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
