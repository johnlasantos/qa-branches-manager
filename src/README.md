
# Git Branch Manager - Frontend

![React](https://img.shields.io/badge/React-18.x-blue)
![Vite](https://img.shields.io/badge/Vite-Latest-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

The frontend application for Git Branch Manager built with React, Vite, TypeScript, and Tailwind CSS.

## 📋 Overview

This frontend provides an intuitive user interface for managing Git branches with features including:

- Viewing and searching both local and remote branches
- Switching between branches with status feedback
- Deleting and cleaning up unused branches
- Pulling latest changes from remote repositories

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Development Setup

1. Navigate to the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the development server at:
   ```
   http://localhost:8080/
   ```

## 🛠️ Building for Production

To build the frontend for production:

```bash
npm run build
```

This will generate optimized files in the `dist/manager` directory.

## 📦 Project Structure

```
src/
├── components/         # React components
│   ├── ui/             # Shadcn UI components
│   └── ...             # Application-specific components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── services/           # API service layer
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## ⚙️ Key Components

### GitBranchManager

The main component that orchestrates the branch management interface.

### BranchList & BranchSearch

Components for displaying and interacting with local and remote branches.

### ConfigContext

Provides application configuration to all components, loading from the backend.

### GitService

Service for making API calls to the backend Git operations.

## 🔧 Configuration

The frontend uses a configuration loaded from the backend API. In development mode, this is fetched from:

```
/api/config
```

In production, it's loaded from:

```
../config.json
```

## 🧪 Development Tips

- The application uses Vite for fast development and hot module replacement
- API calls in development are proxied through the Vite server to avoid CORS issues
- Environment mode checking uses `import.meta.env.DEV` to differentiate development and production

## 💪 Extending the Application

To add new features:

1. Create new components in the `components` directory
2. Add new API methods in `services/gitService.ts` if needed
3. Incorporate the new functionality in the main `GitBranchManager` component
4. Update the relevant context providers if configuration changes are needed

## 🔍 Troubleshooting

### Common Issues

- **API Connection Errors**: Check that the backend server is running and the API URL is correctly set in config
- **Git Command Failures**: Ensure Git is installed and in the PATH of the system running the backend
- **Styling Issues**: Check Tailwind classes and the component import order

### Dev Tools

Use React Developer Tools and browser console for debugging. Console logs are conditionally displayed only in development mode.
