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