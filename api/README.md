# 🚀 Branch Manager - Unified Build

This package contains the ready-to-deploy version of the Branch Manager application, including both frontend and backend.

---

## 📦 Requirements

- Node.js (version 14 or higher)
- Git installed and available in system PATH
- Access to a Git repository (to be managed)

---

## 🛠️ Installation

After extracting the package, follow these steps:

### 1. Install dependencies

**Windows / Linux / MacOS**

```bash
npm install
```

---

### 2. Configure your repository path

Edit the `config.json` file to set the path to your Git repository.

Example:

```json
{
  "repositoryPath": "C:/Users/YourUser/Projects/YourRepo"
}
```

> 💡 On Windows, prefer using forward slashes `/` or double backslashes `\`.

---

### 3. Run manually for testing (Development mode)

Start the API manually:

```bash
npm install -g pm2
npm install
npm install pm2-windows-startup -g
pm2 start server.js --name branches-manager-api
pm2 save
```

Ensure the environment variable `PM2_HOME` is set to the correct folder, for example:

```
C:\Users\Administrator.EC2AMAZ-HLNBM9K\.pm2
```

If needed:

```bash
set PM2_HOME=C:\Users\Administrator.EC2AMAZ-HLNBM9K\.pm2
```

---

### 4. Configure automatic startup with NSSM

In the root folder, `nssm.exe` is already included.

Create a Windows service to auto-start PM2:

```bash
nssm install branches-manager-api
```

In the NSSM UI:

- **Application Path**: path to your `pm2.cmd` (example: `C:\Users\Administrator\AppData\Roaming\npm\pm2.cmd`)
- **Arguments**: `resurrect`
- **Startup Directory**: folder containing `pm2.cmd` or project folder.

**Log On tab**:

- Select "This account:"
- Set it to the user obtained by `whoami` (e.g., `EC2AMAZ-HLNBM9K\Administrator`)
- Provide the password.

**Environment tab**:

- Add variable:

| Variable Name | Value |
|:---|:---|
| `PM2_HOME` | `C:\Users\Administrator.EC2AMAZ-HLNBM9K\.pm2` |

Start the service:

```bash
nssm start branches-manager-api
```

✅ The API will now start automatically at system boot without manual login!

---

### 5. (Optional) Hide terminal popups

All Git command executions already use `{ windowsHide: true }`, preventing visible CMD windows when executing Git operations.

---

## 🌐 Accessing the Application

- API endpoints:

```
http://127.0.0.1:3001/branches
```
or
```
http://heineken.scriptcase.net:3001/branches
```

- Frontend (React console) via Apache:

```
http://heineken.scriptcase.net:8092/console/manager/
```

---

## 📋 Useful Commands

- Install dependencies: `npm install`
- Start the API manually: `pm2 start server.js --name branches-manager-api`
- Save PM2 process list: `pm2 save`
- Restart API: `pm2 restart branches-manager-api`
- View API logs: `pm2 logs branches-manager-api`

---

## ❗ Troubleshooting

| Issue | Solution |
|:---|:---|
| `Cannot GET /branches` | Ensure server is running and listening |
| Repository not found | Verify `repositoryPath` points to a valid Git repository |
| Git errors | Ensure Git is installed and accessible in system PATH |
| Service not starting automatically | Confirm PM2 resurrect is set correctly and NSSM service is active |

---

Enjoy managing your Git branches easily! 🚀