
# Git Branch Manager

![Git Branch Manager](https://img.shields.io/badge/Branch-Manager-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

Manage your Git branches easily through a simple and clean web interface.

---

## 📋 What It Does

- View local and remote branches
- Switch between branches
- Create branches from remote
- Delete local branches
- Clean up old or deprecated branches
- Pull the latest changes from remote
- Sync with remote repository
- Track developer commits and activity

---

## 🚀 Quick Start

### Requirements

- [Node.js](https://nodejs.org/) (v14+)
- [Git](https://git-scm.com/)
- Access to a Git repository

### Setup

```bash
# Clone the repository
git clone [repository-url]
cd git-branch-manager

# Install dependencies
npm install

# Build the project
node build.cjs

# Go to the build output
cd dist
npm install

# Start the server
npm start
```

Access it at: [http://localhost:3001/manager/](http://localhost:3001/manager/)

---

## 🛠️ Development Mode

To develop with live reload:

```bash
npm run dev
```

This will start:
- Frontend (Vite)
- Backend API (Express)

---

## 📦 Project Structure

```
git-branch-manager/
├── api/         # Backend API (Node.js)
├── src/         # Frontend app (React)
├── dist/        # Built production files
│   ├── manager/ # Frontend output
│   ├── server.js
│   └── config.json
├── build.cjs    # Build script
└── vite.config.ts
```

---

## ⚙️ Configuration

Edit `dist/config.json`:

```json
{
  "repositoryPath": ".",
  "headerLink": "https://project.domain.com/",
  "basePath": "/",
  "apiBaseUrl": "https://api.domain.com/"
}
```

**Fields:**
- `repositoryPath`: Path to your Git repo
- `headerLink`: Link for branding
- `basePath`: Base URL path
- `apiBaseUrl`: API URL

---

## 🔌 API Endpoints

### Branch Management

| Endpoint | Method | Description |
|:---------|:------|:------------|
| `/config` | GET | Get configuration |
| `/branches` | GET | List local branches (paginated) |
| `/remote-branches` | GET | List remote branches (paginated) |
| `/remote-branches/search` | GET | Search remote branches |
| `/checkout` | POST | Switch to branch |
| `/delete-branch` | POST | Delete a branch |
| `/pull` | POST | Pull latest changes |
| `/cleanup` | POST | Clean stale branches |
| `/status` | GET | Get repo status |
| `/update-all-branches` | POST | Update all local branches |

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

### Developer Commits

#### POST `/commits`

Retrieves recent commits for a developer by email, including grouped emails for the same developer.

**Request Parameters:**
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

### Pagination

Use `page` and `limit` query parameters for branch endpoints:

```bash
GET /branches?page=0&limit=20
GET /remote-branches?page=1&limit=10
```

---

## 🔧 Production Deployment

### Manual

```bash
# Copy dist to your server
# Inside dist:
npm install
# Edit config.json
node server.js
```

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start server.js --name git-branch-manager
pm2 startup
pm2 save
```

### Windows Service (NSSM)

- Use `nssm.exe` included in the `dist` folder.
- Follow PM2 setup if needed.

---

## 📚 More Docs

- [Frontend Guide](src/README.md)
- [Backend API Guide](api/README.md)

---

## 🤝 Contributions

Feel free to contribute! 🚀

```bash
# Fork → Create a branch → Commit → Push → Open a PR
```

---

## 📝 License

Licensed under the [MIT License](LICENSE).
