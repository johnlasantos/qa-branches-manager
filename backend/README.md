
# Git Branch Manager - Backend

This is the backend for the Git Branch Manager application. It provides a REST API to interact with Git repositories.

## Requirements

- Node.js (v14 or higher)
- A Git repository to manage

## Setup Instructions

1. Install dependencies:

```bash
cd backend
npm install
```

2. Configure the repository path:

Edit the `config.json` file and set the `repositoryPath` to the absolute path of your Git repository.

```json
{
  "repositoryPath": "/path/to/your/git/repository"
}
```

3. Start the server:

```bash
npm start
```

The server will run on port 3001 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

- `GET /branches` - Returns a list of local branches
- `GET /remote-branches` - Returns a list of remote branches
- `GET /remote-branches/search?q=query` - Searches for remote branches
- `POST /checkout` - Switches to a specified branch
- `POST /delete-branch` - Deletes a specified branch
- `POST /pull` - Pulls the latest changes from the current branch
- `POST /cleanup` - Removes stale/merged branches
- `GET /status` - Returns the current status of the repository

## Frontend Configuration

To connect your frontend to this backend:

1. Create a `.env` file in the frontend root directory with:

```
VITE_API_BASE_URL=http://localhost:3001
```

2. Adjust the URL if your backend is running on a different host or port.

## Troubleshooting

- If you get errors about the repository path not being found, make sure the path in `config.json` is correct and the directory exists.
- Make sure the user running the Node.js process has read/write access to the Git repository.
- If you get CORS errors, verify that the frontend URL is correctly accessing the backend.

