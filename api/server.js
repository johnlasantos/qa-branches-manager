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

// Developer groups for commit filtering
const devGroups = [
  ['yuri@netmake.com.br', 'yuri@netmake.com.br'],
  ['caio@netmake.com.br', 'caio@scriptcase.com.br'],
  ['eloy@netmake.com.br', 'eloy@scriptcase.com.br'],
  ['israel@netmake.com.br', 'israel@scriptcase.com.br'],
  ['marcia@netmake.com.br', 'marcia@scriptcase.com.br'],
  ['servers@netmake.com.br', 'servers@scriptcase.com.br'],
  ['r.carlos@netmake.com.br', 'r.carlos@scriptcase.com.br'],
  ['m.cardoso@netmake.com.br', 'm.cardoso@scriptcase.com.br'],
  ['jefferson@netmake.com.br', 'jefferson@scriptcase.com.br'],
  ['rumosem.14', 'diogo@netmake.com.br', 'diogo@scriptcase.com.br'],
  ['vmunizm@gmail.com', 'vinicius@netmake.com.br', 'vinicius@scriptcase.com.br'],
  ['alvaro@netmake.com.br', 'a.moura@netmake.com.br', 'a.moura@scriptcase.com.br'],
  ['roman@netmake.com.br', 'romanlh@netmake.com.br', 'roman@scriptcase.com.br', 'romanlh@scriptcase.com.br'],
  ['sergio@netmake.com.br', 'galindo@netmake.com.br', 'sergio@scriptcase.com.br', 'galindo@scriptcase.com.br'],
  ['j.lennon', 'john@netmake.com.br', 'johnlasantos@gmail.com', 'j.lennon@netmake.com.br', 'j.lennon@netmake.com.br', 'j.netmake@netmake.com.br', 'j.lennon@scriptcase.com.br'],
  ['h.barros@netmake.com.br', 'henrique@netmake.com.br', 'barros.henrique@gmail.com', 'henrique@scriptcase.com.br', 'h.barros@scriptcase.com.br', 'barros.henrique.c@gmail.com'],
  ['ronyan@netmake.com.br', 'r.alves@netmake.com.br', 'ronyan@scriptcase.com.br', 'r.alves@scriptcase.com.br', 'root@macbook-air-de-ronyan.local', 'ronyan@macbook-air-de-ronyan.local'],
];

// Helper function to find developer group by email
function findGroupByEmail(email, groups) {
  for (const group of groups) {
    if (group.includes(email)) {
      return group;
    }
  }
  return [email];
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
      // Run a fetch to update refs without the quiet flag (which is not supported)
      await runGitCommand('git remote update origin', null, 0);
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

// Sync endpoint - equivalent to the PHP sync functionality
app.post('/sync', async (req, res) => {
  try {
    const result = await runGitCommand('git fetch --prune');
    
    if (result.success) {
      // Clear caches after successful sync
      clearCache();
      res.json({ 
        success: true,
        message: 'Repository synchronized successfully.',
        stdout: result.stdout,
        stderr: result.stderr
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: 'Failed to sync with remote repository.',
        details: result.stderr || 'Unknown error',
        stdout: result.stdout,
        stderr: result.stderr
      });
    }
  } catch (error) {
    console.error('Error during sync:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to sync: ${error.message}`,
      stdout: '',
      stderr: error.message
    });
  }
});

// Commits endpoint - equivalent to the PHP commit functionality
app.post('/commits', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or missing "email" parameter.' 
      });
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    const emails = findGroupByEmail(normalizedEmail, devGroups);
    
    const allCommits = [];
    
    // Get commits for each email in the group
    for (const devEmail of emails) {
      const gitCommand = `git log --remotes -n 2 --pretty="format:%H|%an|%ae|%ad|%s" --date=iso --author="${devEmail}"`;
      const result = await runGitCommand(gitCommand);
      
      if (result.success && result.stdout.trim() !== '') {
        const lines = result.stdout.trim().split('\n');
        
        for (const line of lines) {
          if ((line.match(/\|/g) || []).length < 4) {
            continue;
          }
          
          const [hash, authorName, authorEmail, date, message] = line.split('|', 5);
          
          allCommits.push({
            hash,
            author: authorName,
            email: authorEmail,
            date,
            message,
          });
        }
      }
    }
    
    // Sort commits by date (newest first)
    allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allCommits.length === 0) {
      return res.json({ 
        success: false,
        message: 'No commits found for this user.',
        commits: []
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const lastCommitDate = new Date(allCommits[0].date);
    const prevCommitDate = allCommits[1] ? new Date(allCommits[1].date) : null;
    
    const lastDay = lastCommitDate.toISOString().split('T')[0];
    const prevDay = prevCommitDate ? prevCommitDate.toISOString().split('T')[0] : null;
    
    const daysSinceLast = Math.floor((new Date(today) - new Date(lastDay)) / (1000 * 60 * 60 * 24));
    const daysBetweenCommits = prevDay ? Math.floor((new Date(lastDay) - new Date(prevDay)) / (1000 * 60 * 60 * 24)) : null;
    
    const response = {
      success: true,
      last_commit: lastCommitDate.toISOString().replace('T', ' ').split('.')[0],
      previous_commit: prevCommitDate ? prevCommitDate.toISOString().replace('T', ' ').split('.')[0] : null,
      days_since_last_commit: daysSinceLast,
      days_between_commits: daysBetweenCommits,
      commits: allCommits.slice(0, 2),
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting commits:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to get commits: ${error.message}`,
      commits: []
    });
  }
});

// Get all local branches with pagination - OPTIMIZED
app.get('/branches', async (req, res) => {
  try {
    // Support pagination
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skipRefresh = req.query.skipRefresh === 'true';
    
    // Note: We've removed the cache check and will always execute Git commands
    // to get the most up-to-date branch list

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
    
    // Note: We've removed caching the result - always returning fresh data
    
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
    
    // Get all remote branches and filter in JavaScript instead of using grep
    const { stdout } = await runGitCommand('git for-each-ref --format="%(refname:short)" refs/remotes/origin/');
    
    // Filter branches by search query in JavaScript (more reliable than grep)
    const allMatchingBranches = stdout
      .split('\n')
      .filter(Boolean)
      .map(line => line.trim().replace('origin/', ''))
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .map(name => ({ name }));
    
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

// Switch branch - OPTIMIZED with JavaScript-based branch detection
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
    
    // Get local branches using for-each-ref and detect using JavaScript
    const { stdout: localBranchOutput } = await runGitCommand(
      'git for-each-ref --format="%(refname:short)" refs/heads/'
    );
    
    // Get remote branches using for-each-ref and detect using JavaScript
    const { stdout: remoteBranchOutput } = await runGitCommand(
      'git for-each-ref --format="%(refname:short)" refs/remotes/origin/'
    );
    
    // Parse branch lists
    const localBranches = localBranchOutput
      .split('\n')
      .filter(Boolean)
      .map(b => b.trim());
    
    const remoteBranches = remoteBranchOutput
      .split('\n')
      .filter(Boolean)
      .map(b => b.trim());
    
    // Check if branch exists locally or remotely using JavaScript includes()
    const branchExistsLocally = localBranches.includes(branch);
    const branchExistsRemotely = remoteBranches.includes(`origin/${branch}`);
    
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

// Delete branch - OPTIMIZED with JavaScript-based branch detection
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

// Cleanup branches (prune stale branches) - OPTIMIZED with JavaScript-based branch detection
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

// Update all branches endpoint - OPTIMIZED with sequential execution
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
    const branchesToUpdate = localBranches.filter(local => 
      remoteBranches.includes(local)
    );
    
    // IMPORTANT: Run updates SEQUENTIALLY using for await...of instead of Promise.all
    // to avoid git lock conflicts
    const results = [];
    
    for (const branch of branchesToUpdate) {
      // Checkout the branch
      const checkoutResult = await runGitCommand(`git checkout ${branch}`);
      if (!checkoutResult.success) {
        results.push({ 
          branch, 
          success: false, 
          output: `Failed to checkout branch: ${checkoutResult.stderr || checkoutResult.stdout}` 
        });
        continue; // Skip pull if checkout failed
      }
      
      // Pull the latest changes
      const pullResult = await runGitCommand(`git pull origin ${branch}`);
      results.push({ 
        branch, 
        success: pullResult.success, 
        output: pullResult.stderr || pullResult.stdout || 'No output'
      });
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
