
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

// Convert exec to Promise-based
const execAsync = util.promisify(exec);

// Create a cache with TTL of 5 minutes
const gitCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes cache lifetime
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Store direct references for better memory performance
});

const app = express();
const PORT = process.env.PORT || 3001;

// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Determine if we're running in production/unified build
const isProduction = fs.existsSync(path.join(__dirname, 'public'));

// Load config
let config = { 
  repositoryPath: '.',
  headerLink: 'http://athena.scriptcase.net:8092/scriptcase-git/',
  apiBaseUrl: isProduction ? '/' : 'http://localhost:3001/',
  basePath: '/'
};
const configPath = path.join(__dirname, 'config.json');

try {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    // Create default config file if it doesn't exist
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    if (isDevelopment) {
      console.log(`Created default config file at ${configPath}`);
    }
  }
} catch (error) {
  console.error('Error loading config:', error);
}

// Validate repository path exists
if (!fs.existsSync(config.repositoryPath)) {
  console.error(`Repository path not found: ${config.repositoryPath}`);
  console.error('Please update the config.json file with a valid path.');
}

// Helper function to execute git commands with caching
async function runGitCommand(command, cacheKey = null, cacheTTL = 300) {
  try {
    // Check cache if a cache key is provided
    if (cacheKey && gitCache.has(cacheKey)) {
      return gitCache.get(cacheKey);
    }
    
    const { stdout, stderr } = await execAsync(command, { 
      cwd: config.repositoryPath,
      windowsHide: true
    });
    
    const result = { 
      success: true, 
      stdout: stdout || '', 
      stderr: stderr || '', 
      code: 0 
    };
    
    // Store result in cache if cache key is provided
    if (cacheKey) {
      gitCache.set(cacheKey, result, cacheTTL);
    }
    
    return result;
  } catch (error) {
    console.error(`Git command failed: ${command}`, error);
    
    const result = { 
      success: false, 
      stdout: error.stdout || '', 
      stderr: error.stderr || error.message || '', 
      code: error.code || 1 
    };
    
    return result;
  }
}

// Clear specific cache entries
function clearCache(pattern = null) {
  if (pattern) {
    const keys = gitCache.keys().filter(key => key.includes(pattern));
    keys.forEach(key => gitCache.del(key));
  } else {
    gitCache.flushAll();
  }
}

// Background repository update (runs every 15 minutes)
let lastBackgroundUpdateTime = 0;
const BACKGROUND_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes

// Function to update repository data in the background
async function updateRepositoryBackground() {
  const now = Date.now();
  
  // Only run if the last update was more than BACKGROUND_UPDATE_INTERVAL ago
  if (now - lastBackgroundUpdateTime > BACKGROUND_UPDATE_INTERVAL) {
    lastBackgroundUpdateTime = now;
    
    try {
      // Run a light fetch to update refs without the heavyweight prune operation
      await runGitCommand('git remote update origin --quiet', null, 0);
      console.log('Background repository update completed');
      
      // Clear relevant caches after update
      clearCache('branches');
      clearCache('remote');
    } catch (error) {
      console.error('Background repository update failed:', error);
    }
  }
}

// If in production mode, serve static files from the manager directory
if (isProduction) {
  const managerPath = path.join(__dirname, 'manager');
  if (isDevelopment) {
    console.log(`Serving static files from: ${managerPath}`);
  }
  app.use(express.static(managerPath));
  
  // Explicitly serve the config.json file for the frontend to fetch
  app.get('/config.json', (req, res) => {
    try {
      // Send the safe config as json
      const safeConfig = {
        headerLink: config.headerLink || 'http://athena.scriptcase.net:8092/scriptcase-git/',
        apiBaseUrl: config.apiBaseUrl || 'http://localhost:3001/',
        basePath: config.basePath || '/'
      };
      res.json(safeConfig);
    } catch (error) {
      console.error('Error serving config.json:', error);
      res.status(500).json({ success: false, message: 'Failed to serve configuration' });
    }
  });
}

// Config endpoint - Return safe configuration values to the frontend
app.get('/config', (req, res) => {
  try {
    // Only send safe configuration values to the frontend
    const safeConfig = {
      headerLink: config.headerLink || 'http://athena.scriptcase.net:8092/scriptcase-git/',
      apiBaseUrl: config.apiBaseUrl || 'http://localhost:3001/',
      basePath: config.basePath || '/'
    };
    res.json(safeConfig);
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({ success: false, message: 'Failed to get configuration' });
  }
});

// Get all local branches with pagination - OPTIMIZED
app.get('/branches', async (req, res) => {
  try {
    // Support pagination
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skipRefresh = req.query.skipRefresh === 'true';
    const cacheKey = `branches_${page}_${limit}`;
    
    // Check if we already have cached data
    if (!skipRefresh && gitCache.has(cacheKey)) {
      return res.json(gitCache.get(cacheKey));
    }

    // Get current branch using faster git-rev-parse instead of git branch
    const currentBranchPromise = runGitCommand('git rev-parse --abbrev-ref HEAD');
    
    // Use for-each-ref which is much faster than git branch
    const localBranchesPromise = runGitCommand('git for-each-ref --format="%(refname:short)" refs/heads/');
    
    // Get remote branches more efficiently
    const remoteBranchesPromise = runGitCommand('git for-each-ref --format="%(refname:short)" refs/remotes/origin/');
    
    // Execute commands in parallel
    const [currentBranchResult, localBranchesResult, remoteBranchesResult] = await Promise.all([
      currentBranchPromise,
      localBranchesPromise, 
      remoteBranchesPromise
    ]);
    
    const currentBranch = currentBranchResult.stdout.trim();
    
    // Parse local branches output
    const allBranches = localBranchesResult.stdout
      .split('\n')
      .filter(Boolean)
      .map(name => {
        name = name.trim();
        const isCurrent = name === currentBranch;
        
        return { 
          name, 
          current: isCurrent, 
          isCurrent: isCurrent,
          hasRemote: false // Will set this below
        };
      });
    
    // Parse remote branches and mark local branches that have remotes
    const remoteNames = remoteBranchesResult.stdout
      .split('\n')
      .filter(Boolean)
      .map(name => name.trim().replace('origin/', ''));
    
    // Mark which local branches have remote tracking branches
    allBranches.forEach(branch => {
      branch.hasRemote = remoteNames.includes(branch.name);
    });
    
    // Get total count for pagination info
    const total = allBranches.length;
    
    // Paginate the results
    const paginatedBranches = allBranches.slice(page * limit, (page + 1) * limit);
    
    // Create response object with pagination metadata
    const response = {
      branches: paginatedBranches,
      pagination: {
        page,
        limit,
        total,
        hasMore: (page + 1) * limit < total
      }
    };
    
    // Cache the result
    gitCache.set(cacheKey, response, 60); // 1 minute cache
    
    // Return response
    res.json(response);
    
    // Trigger a background update for future requests
    if (!skipRefresh) {
      updateRepositoryBackground();
    }
  } catch (error) {
    console.error('Error getting branches:', error);
    res.status(500).json({ success: false, message: 'Failed to get branches' });
  }
});

// Get all remote branches with pagination - OPTIMIZED
app.get('/remote-branches', async (req, res) => {
  try {
    // Support pagination
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skipRefresh = req.query.skipRefresh === 'true';
    const cacheKey = `remote_branches_${page}_${limit}`;
    
    // Check if we already have cached data
    if (!skipRefresh && gitCache.has(cacheKey)) {
      return res.json(gitCache.get(cacheKey));
    }
    
    // Use for-each-ref instead of branch -r (more efficient)
    const { stdout } = await runGitCommand('git for-each-ref --format="%(refname:short)" refs/remotes/origin/');
    
    // Get all remote branches
    const allBranches = stdout
      .split('\n')
      .filter(Boolean)
      .filter(line => !line.includes('origin/HEAD')) // Filter out HEAD pointer
      .map(line => {
        const name = line.trim().replace('origin/', '');
        return { name };
      });
    
    // Get total count for pagination info
    const total = allBranches.length;
    
    // Paginate the results
    const paginatedBranches = allBranches.slice(page * limit, (page + 1) * limit);
    
    // Create response with pagination metadata
    const response = {
      branches: paginatedBranches,
      pagination: {
        page,
        limit,
        total,
        hasMore: (page + 1) * limit < total
      }
    };
    
    // Cache the result
    gitCache.set(cacheKey, response, 120); // 2 minute cache
    
    // Return response
    res.json(response);
    
    // Trigger a background update for future requests
    if (!skipRefresh) {
      updateRepositoryBackground();
    }
  } catch (error) {
    console.error('Error getting remote branches:', error);
    res.status(500).json({ success: false, message: 'Failed to get remote branches' });
  }
});

// Search remote branches with pagination - OPTIMIZED
app.get('/remote-branches/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const cacheKey = `search_${query}_${page}_${limit}`;
    
    // Check if we already have cached data for this search
    if (gitCache.has(cacheKey)) {
      return res.json(gitCache.get(cacheKey));
    }
    
    // More efficient command using for-each-ref and grep for searching
    const command = query.trim() ? 
      `git for-each-ref --format="%(refname:short)" refs/remotes/origin/ | grep -i "${query}"` : 
      'git for-each-ref --format="%(refname:short)" refs/remotes/origin/';
    
    const { stdout, success } = await runGitCommand(command);
    
    // Parse the results, handling the case where grep returns no matches (non-zero exit code)
    const lines = success ? stdout.split('\n') : [];
    
    // Filter branches by search query
    const allMatchingBranches = lines
      .filter(Boolean)
      .map(line => {
        const name = line.trim().replace('origin/', '');
        return { name };
      });
    
    // Get total count for pagination info
    const total = allMatchingBranches.length;
    
    // Paginate the results
    const paginatedBranches = allMatchingBranches.slice(page * limit, (page + 1) * limit);
    
    // Create response with pagination metadata
    const response = {
      branches: paginatedBranches,
      pagination: {
        page,
        limit,
        total,
        hasMore: (page + 1) * limit < total
      }
    };
    
    // Cache the result for searches
    gitCache.set(cacheKey, response, 60); // 1 minute cache
    
    // Return response
    res.json(response);
  } catch (error) {
    console.error('Error searching branches:', error);
    res.status(500).json({ success: false, message: 'Failed to search branches' });
  }
});

// Switch branch - OPTIMIZED
app.post('/checkout', async (req, res) => {
  try {
    const { branch } = req.body;
    
    if (!branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Branch name is required' 
      });
    }
    
    // Clear cache for branches since the current branch is changing
    clearCache('branches');
    
    // First check if the branch exists locally using faster for-each-ref
    const { stdout: localBranchOutput } = await runGitCommand(
      `git for-each-ref --format="%(refname:short)" refs/heads/ | grep -Fx "${branch}" || echo ""`
    );
    
    // Check if branch exists remotely
    const { stdout: remoteBranchOutput } = await runGitCommand(
      `git for-each-ref --format="%(refname:short)" refs/remotes/origin/ | grep -Fx "origin/${branch}" || echo ""`
    );
    
    const branchExistsLocally = localBranchOutput.trim() === branch;
    const branchExistsRemotely = remoteBranchOutput.trim() === `origin/${branch}`;
    
    let result;
    
    if (branchExistsLocally) {
      // Branch exists locally, just check it out
      result = await runGitCommand(`git checkout ${branch}`);
    } else if (branchExistsRemotely) {
      // Branch exists remotely but not locally, create from remote
      result = await runGitCommand(`git checkout -b ${branch} origin/${branch}`);
    } else {
      return res.status(404).json({ 
        success: false, 
        message: `Branch '${branch}' not found locally or remotely`,
        stdout: '',
        stderr: `Branch '${branch}' not found locally or remotely` 
      });
    }
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: `Switched to branch '${branch}'`,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } else {
      console.error('Checkout failed:', result.stderr);
      return res.status(500).json({ 
        success: false, 
        message: `Failed to switch to branch '${branch}': ${result.stderr}`,
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to switch to branch: ${error.message}`,
      stdout: '',
      stderr: error.message,
      code: error.code || 1
    });
  }
});

// Delete branch - OPTIMIZED
app.post('/delete-branch', async (req, res) => {
  try {
    const { branch } = req.body;
    
    if (!branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Branch name is required',
        stdout: '',
        stderr: 'Branch name is required' 
      });
    }
    
    // Clear cache for branches since we're modifying the branch list
    clearCache('branches');
    
    // Check if branch is current using faster rev-parse
    const { stdout: currentBranchOutput } = await runGitCommand('git rev-parse --abbrev-ref HEAD');
    const currentBranch = currentBranchOutput.trim();
    
    if (currentBranch === branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete the current branch',
        stdout: '',
        stderr: 'Cannot delete the current branch'
      });
    }
    
    // Delete the branch
    const result = await runGitCommand(`git branch -d ${branch}`);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Deleted branch ${branch}`,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } else {
      // If forced deletion is needed
      console.log('Regular delete failed, trying force delete');
      const forceResult = await runGitCommand(`git branch -D ${branch}`);
      if (forceResult.success) {
        res.json({ 
          success: true, 
          message: `Force deleted branch ${branch}`,
          stdout: forceResult.stdout,
          stderr: forceResult.stderr
        });
      } else {
        console.error('Force delete failed:', forceResult.stderr);
        res.status(500).json({ 
          success: false, 
          message: forceResult.stderr,
          stdout: forceResult.stdout,
          stderr: forceResult.stderr,
          code: forceResult.code
        });
      }
    }
  } catch (error) {
    console.error('Error during delete branch:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to delete branch: ${error.message}`,
      stdout: '',
      stderr: error.message,
      code: error.code || 1
    });
  }
});

// Pull current branch - OPTIMIZED
app.post('/pull', async (req, res) => {
  try {
    // Clear cache for branches since we're updating the current branch
    clearCache('branches');
    
    const result = await runGitCommand('git pull');
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.stdout || 'Already up to date.',
        stdout: result.stdout,
        stderr: result.stderr
      });
    } else {
      console.error('Pull failed:', result.stderr);
      res.status(500).json({ 
        success: false, 
        message: result.stderr || 'Pull failed',
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code
      });
    }
  } catch (error) {
    console.error('Error during pull:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to pull: ${error.message}`,
      stdout: '',
      stderr: error.message,
      code: error.code || 1
    });
  }
});

// Cleanup branches (prune stale branches) - OPTIMIZED
app.post('/cleanup', async (req, res) => {
  try {
    // Clear cache for branches since we're modifying the branch list
    clearCache('branches');
    
    // Get local branches using more efficient for-each-ref
    const { stdout: localOutput } = await runGitCommand(
      'git for-each-ref --format="%(refname:short) %(upstream)" refs/heads/'
    );
    
    const localBranches = localOutput
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const parts = line.trim().split(' ');
        const name = parts[0];
        const hasUpstream = parts.length > 1 && parts[1]; // If there's an upstream reference
        
        return { name, hasUpstream };
      });
    
    // Get current branch to avoid deleting it
    const { stdout: currentBranchOutput } = await runGitCommand('git rev-parse --abbrev-ref HEAD');
    const currentBranch = currentBranchOutput.trim();
    
    // Find branches that don't have upstream (remote tracking branches)
    const staleBranches = localBranches.filter(local => {
      // Skip current branch and protected branches
      if (local.name === currentBranch || ['main', 'master', 'develop'].includes(local.name)) {
        return false;
      }
      
      // Consider branches without upstream as stale
      return !local.hasUpstream;
    });
    
    if (staleBranches.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No deprecated branches to remove.' 
      });
    }
    
    // Delete each stale branch - can be done in parallel for better performance
    const deletePromises = staleBranches.map(branch => 
      runGitCommand(`git branch -d ${branch.name}`)
        .then(result => {
          if (!result.success) {
            return runGitCommand(`git branch -D ${branch.name}`);
          }
          return result;
        })
        .then(result => ({
          branch: branch.name,
          success: result.success,
          output: result.stdout || result.stderr
        }))
    );
    
    const results = await Promise.all(deletePromises);
    
    const successResults = results.filter(r => r.success);
    const errorResults = results.filter(r => !r.success);
    
    const message = successResults.length > 0 
      ? `${successResults.map(r => `Deleted branch ${r.branch}`).join('\n')}\n${successResults.length} deprecated branches removed.`
      : 'No branches were removed.';
    
    res.json({ 
      success: true, 
      message: message,
      stdout: message,
      stderr: errorResults.length > 0 ? errorResults.map(r => `Failed to delete ${r.branch}: ${r.output}`).join('\n') : '',
      warnings: errorResults.length > 0 ? errorResults.map(r => `Failed to delete ${r.branch}: ${r.output}`) : undefined
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to clean up branches: ${error.message}`,
      stdout: '',
      stderr: error.message,
      code: error.code || 1
    });
  }
});

// Status endpoint - OPTIMIZED with caching
app.get('/status', async (req, res) => {
  try {
    const cacheKey = 'git_status';
    
    // Check if status is cached (cache for 10 seconds only)
    if (gitCache.has(cacheKey)) {
      return res.json(gitCache.get(cacheKey));
    }
    
    const result = await runGitCommand('git status --porcelain');
    
    const response = { 
      success: true, 
      status: result.stdout,
      stdout: result.stdout,
      stderr: result.stderr 
    };
    
    // Cache status for a short period (10 seconds)
    gitCache.set(cacheKey, response, 10);
    
    res.json(response);
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get status: ${error.message}`,
      stdout: '',
      stderr: error.message,
      code: error.code || 1
    });
  }
});

// Update all branches endpoint - OPTIMIZED
app.post('/update-all-branches', async (req, res) => {
  try {
    // Clear branch caches since we'll be updating branches
    clearCache('branches');
    
    // Get local branches using for-each-ref
    const { stdout: localBranchesOutput } = await runGitCommand('git for-each-ref --format="%(refname:short)" refs/heads/');
    const localBranches = localBranchesOutput
      .split('\n')
      .filter(Boolean)
      .map(name => name.trim());
    
    // Get current branch
    const { stdout: currentBranchOutput } = await runGitCommand('git rev-parse --abbrev-ref HEAD');
    const currentBranch = currentBranchOutput.trim();
    
    // Get remote branches to see which local branches have remotes
    const { stdout: remoteBranchesOutput } = await runGitCommand('git for-each-ref --format="%(refname:short)" refs/remotes/origin/');
    const remoteBranches = remoteBranchesOutput
      .split('\n')
      .filter(Boolean)
      .map(name => name.trim().replace('origin/', ''));
    
    // Find local branches that have matching remote branches
    const branchesToUpdate = localBranches.filter(localBranch => 
      remoteBranches.includes(localBranch)
    );
    
    // Update branches in parallel for better performance
    const updatePromises = branchesToUpdate.map(async branch => {
      // Checkout the branch
      const checkoutResult = await runGitCommand(`git checkout ${branch}`);
      if (!checkoutResult.success) {
        return { 
          branch, 
          success: false, 
          output: `Failed to checkout branch: ${checkoutResult.stderr || checkoutResult.stdout}` 
        };
      }
      
      // Pull the latest changes
      const pullResult = await runGitCommand(`git pull origin ${branch}`);
      return { 
        branch, 
        success: pullResult.success, 
        output: pullResult.stderr || pullResult.stdout || 'No output'
      };
    });
    
    // Run updates sequentially to avoid git lock conflicts
    const results = [];
    for (const updatePromise of updatePromises) {
      results.push(await updatePromise);
    }
    
    // Switch back to the original branch
    await runGitCommand(`git checkout ${currentBranch}`);
    
    // Determine overall success
    const overallSuccess = results.every(r => r.success);
    
    res.json({ 
      success: true,
      overallSuccess,
      results
    });
  } catch (error) {
    console.error('Error updating all branches:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to update all branches: ${error.message}`,
      stdout: '',
      stderr: error.message,
      code: error.code || 1
    });
  }
});

// If in production mode, handle all other routes for SPA
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  // Only log details in development mode or on initial startup
  if (isDevelopment) {
    console.log(`Git Branch Manager ${isProduction ? 'Production' : 'Development'} Server running on port ${PORT}`);
    console.log(`Using repository at: ${path.resolve(config.repositoryPath)}`);
    console.log(`API Base URL: ${config.apiBaseUrl}`);
    console.log(`Base Path: ${config.basePath}`);
    if (isProduction) {
      console.log(`Serving frontend from: ${path.join(__dirname, 'public')}`);
    }
  } else {
    console.log(`Git Branch Manager Server running on port ${PORT}`);
  }
  
  // Run initial background repository update without blocking server startup
  setTimeout(updateRepositoryBackground, 5000);
});
