
# 🚀 Branch Manager - Unified Build

This package contains the ready-to-deploy version of the Branch Manager application, including both frontend and backend.

## 📦 Requirements

- Node.js (version 14 or higher)
- Access to a Git repository (to be managed)

## 🛠️ Installation

After extracting the ZIP file, follow these steps:

### 1. Install dependencies

**Windows / Linux / MacOS**
```bash
npm install
```

### 2. Configure your repository path

Edit the `config.json` file to set the path to your Git repository.

Example:
```json
{
  "repositoryPath": "/absolute/path/to/your/git/repository"
}
```

On Windows, use double backslashes `\` or forward slashes `/`:
```json
{
  "repositoryPath": "C:/Users/YourUser/Projects/YourRepo"
}
```

### 3. Start the server

**Windows / Linux / MacOS**
```bash
npm start
```

By default, the server will run on **http://localhost:3001**.

You can change the port by setting the `PORT` environment variable:
```bash
# Linux / MacOS
PORT=8080 npm start

# Windows (Powershell)
$env:PORT=8080; npm start

# Windows (CMD)
set PORT=8080 && npm start
```

## 🌐 Accessing the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:3001
```

The frontend will be served automatically, and API endpoints will be available under `/api`.

## 📋 Useful Commands

- Install dependencies: `npm install`
- Start the server: `npm start`
- Change server port: Set `PORT` environment variable before starting

## ❗ Troubleshooting

- **Repository not found**: Make sure the `repositoryPath` in `config.json` points to a valid Git repository.
- **Permission issues**: Ensure that the Node.js process has read/write access to the Git repository folder.
- **CORS errors**: Should not happen, since frontend and backend are served from the same server.

---

Enjoy managing your Git branches easily!
