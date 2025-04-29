# Git Branch Manager - Frontend

![React](https://img.shields.io/badge/React-18.x-blue)
![Vite](https://img.shields.io/badge/Vite-Latest-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

A simple and powerful frontend for Git Branch Manager, built with React, Vite, TypeScript, and Tailwind CSS.

---

## 📋 What You Can Do

- Browse and search local and remote branches
- Switch between branches with live feedback
- Delete unused branches easily
- Pull updates from remote repositories

---

## 🚀 Getting Started

### Requirements

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Setup for Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open: [http://localhost:8080/](http://localhost:8080/)

---

## 🛠️ Building for Production

```bash
npm run build
```

This generates optimized files in the `dist/manager` directory.

---

## 📦 Project Layout

```
src/
├── components/    # React components
│   └── ui/        # Shadcn UI components
├── contexts/      # Context providers
├── hooks/         # Custom hooks
├── lib/           # Helper libraries
├── pages/         # Pages
├── services/      # API services
├── App.tsx        # Main app component
└── main.tsx       # Entry point
```

---

## ⚙️ How It Works

- **GitBranchManager**: main logic for branch management
- **BranchList & BranchSearch**: view and filter branches
- **ConfigContext**: load app settings
- **GitService**: connect to backend API

Configuration is fetched:
- Development: `/api/config`
- Production: `../config.json`

---

## 🧪 Dev Tips

- Powered by Vite for fast HMR (Hot Module Replacement)
- Development API calls are proxied automatically
- Use `import.meta.env.DEV` to detect environment

---

## 💪 Adding Features

1. Add components under `components/`
2. Add services in `services/` if new API calls are needed
3. Update `GitBranchManager` to wire it all together
4. Update contexts if configs are involved

---

## 🔍 Troubleshooting

- **API Errors**: Ensure backend is running and API URL is set
- **Git Errors**: Confirm Git is installed and available in PATH
- **CSS Issues**: Check Tailwind configuration

Use React DevTools and browser console for easy debugging.

---