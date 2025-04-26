const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');

// Convert exec to Promise-based
const execAsync = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load config
let config = { repositoryPath: '.', headerLink: 'http://athena.scriptcase.net:8092/scriptcase-git/' };
const configPath = path.join(__dirname, 'config.json');

try {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    // Create default config file if it doesn't exist
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Created default config file at ${configPath}`);
  }
} catch (error) {
  console.error('Error loading config:', error);
}

// Validate repository path exists
if (!fs.existsSync(config.repositoryPath)) {
  console.error(`Repository path not found: ${config.repositoryPath}`);
  console.error('Please update the config.json file with a valid path.');
}

// Helper function to execute git commands
async function runGitCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: config.repositoryPath });
    return { success: true, output: stdout, error: stderr };
  } catch (error) {
    console.error(`Git command failed: ${command}`, error);
    return { success: false, output: '', error: error.message };
  }
}

// Add this new endpoint before the other routes
app.get('/config', (req, res) => {
  try {
    // Only send safe configuration values to the frontend
    const safeConfig = {
      headerLink: config.headerLink || 'http://athena.scriptcase.net:8092/scriptcase-git/'
    };
    res.json(safeConfig);
  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({ success: false, message: 'Failed to get configuration' });
  }
});

// Endpoints

// Get all local branches
app.get('/branches', async (req, res) => {
  try {
    // Make sure we have the latest info
    await runGitCommand('git fetch --prune');
    
    const { output } = await runGitCommand('git branch -v');
    const { output: remoteOutput } = await runGitCommand('git branch -r');

    const remoteBranches = remoteOutput
      .split('\n')
      .filter(Boolean)
      .map(line => line.trim().replace('origin/', ''));
    
    const branches = output
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const isCurrent = line.startsWith('*');
        const name = line.replace('*', '').trim().split(' ')[0];
        const hasRemote = remoteBranches.some(rb => rb === name);
        
        return { name, current: isCurrent, hasRemote };
      });

    res.json(branches);
  } catch (error) {
    console.error('Error getting branches:', error);
    res.status(500).json({ success: false, message: 'Failed to get branches' });
  }
});

// Get all remote branches
app.get('/remote-branches', async (req, res) => {
  try {
    // Fetch to ensure we have the latest remote branches
    await runGitCommand('git fetch --prune');
    const { output } = await runGitCommand('git branch -r');
    
    const branches = output
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const name = line.trim().replace('origin/', '');
        return { name };
      });

    res.json(branches);
  } catch (error) {
    console.error('Error getting remote branches:', error);
    res.status(500).json({ success: false, message: 'Failed to get remote branches' });
  }
});

// Search remote branches
app.get('/remote-branches/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const { output } = await runGitCommand('git branch -r');
    
    const branches = output
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const name = line.trim().replace('origin/', '');
        return { name };
      })
      .filter(branch => branch.name.toLowerCase().includes(query.toLowerCase()));

    res.json(branches.slice(0, 10)); // Limit to 10 results like the frontend
  } catch (error) {
    console.error('Error searching branches:', error);
    res.status(500).json({ success: false, message: 'Failed to search branches' });
  }
});

// Switch branch - FIXED
app.post('/checkout', async (req, res) => {
  try {
    const { branch } = req.body;
    
    if (!branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Branch name is required' 
      });
    }
    
    // First check if the branch exists locally
    const { output: localBranchOutput } = await runGitCommand('git branch');
    const localBranches = localBranchOutput
      .split('\n')
      .filter(Boolean)
      .map(line => line.replace('*', '').trim());
    
    // Check if branch exists remotely
    const { output: remoteBranchOutput } = await runGitCommand('git branch -r');
    const remoteBranches = remoteBranchOutput
      .split('\n')
      .filter(Boolean)
      .map(line => line.trim())
      .filter(line => line.startsWith('origin/'))
      .map(line => line.replace('origin/', ''));
    
    console.log('Local branches:', localBranches);
    console.log('Remote branches:', remoteBranches);
    console.log('Requested branch:', branch);
    
    let result;
    
    if (localBranches.includes(branch)) {
      // Branch exists locally, just check it out
      console.log('Checking out local branch:', branch);
      result = await runGitCommand(`git checkout ${branch}`);
    } else if (remoteBranches.includes(branch)) {
      // Branch exists remotely but not locally, create from remote
      console.log('Creating and checking out from remote branch:', branch);
      result = await runGitCommand(`git checkout -b ${branch} origin/${branch}`);
    } else {
      return res.status(404).json({ 
        success: false, 
        message: `Branch '${branch}' not found locally or remotely` 
      });
    }
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: `Switched to branch '${branch}'` 
      });
    } else {
      console.error('Checkout failed:', result.error);
      return res.status(500).json({ 
        success: false, 
        message: `Failed to switch to branch '${branch}': ${result.error}` 
      });
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ success: false, message: `Failed to switch to branch: ${error.message}` });
  }
});

// Delete branch
app.post('/delete-branch', async (req, res) => {
  try {
    const { branch } = req.body;
    
    if (!branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Branch name is required' 
      });
    }
    
    // Check if branch is current
    const { output: currentBranchOutput } = await runGitCommand('git branch --show-current');
    const currentBranch = currentBranchOutput.trim();
    
    if (currentBranch === branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete the current branch' 
      });
    }
    
    // Delete the branch
    const result = await runGitCommand(`git branch -d ${branch}`);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Deleted branch ${branch} (was ${result.output.split(' ').pop().trim()}).` 
      });
    } else {
      // If forced deletion is needed
      console.log('Regular delete failed, trying force delete');
      const forceResult = await runGitCommand(`git branch -D ${branch}`);
      if (forceResult.success) {
        res.json({ 
          success: true, 
          message: `Force deleted branch ${branch} (was ${forceResult.output.split(' ').pop().trim()}).` 
        });
      } else {
        console.error('Force delete failed:', forceResult.error);
        res.status(500).json({ success: false, message: forceResult.error });
      }
    }
  } catch (error) {
    console.error('Error during delete branch:', error);
    res.status(500).json({ success: false, message: `Failed to delete branch: ${error.message}` });
  }
});

// Pull current branch
app.post('/pull', async (req, res) => {
  try {
    const result = await runGitCommand('git pull');
    
    if (result.success) {
      res.json({ success: true, message: result.output || 'Already up to date.' });
    } else {
      console.error('Pull failed:', result.error);
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Error during pull:', error);
    res.status(500).json({ success: false, message: `Failed to pull: ${error.message}` });
  }
});

// Cleanup branches (prune stale branches) - FIXED
app.post('/cleanup', async (req, res) => {
  try {
    // First, fetch from remote with prune to update our knowledge of remote branches
    const fetchResult = await runGitCommand('git fetch --prune');
    if (!fetchResult.success) {
      console.error('Fetch failed during cleanup:', fetchResult.error);
      return res.status(500).json({ 
        success: false, 
        message: `Fetch failed: ${fetchResult.error}` 
      });
    }
    
    // Get local branches
    const { output: localOutput } = await runGitCommand('git branch');
    const localBranches = localOutput
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const name = line.replace('*', '').trim();
        const isCurrent = line.includes('*');
        return { name, isCurrent };
      });
    
    // Get remote branches
    const { output: remoteOutput } = await runGitCommand('git branch -r');
    const remoteBranches = remoteOutput
      .split('\n')
      .filter(Boolean)
      .map(line => line.trim().replace('origin/', ''));
    
    // Find branches that exist locally but not remotely
    const staleBranches = localBranches.filter(local => {
      // Skip current branch and protected branches
      if (local.isCurrent || ['main', 'master', 'develop'].includes(local.name)) {
        return false;
      }
      
      // Check if this local branch exists remotely
      return !remoteBranches.includes(local.name);
    });
    
    console.log('Local branches:', localBranches.map(b => b.name));
    console.log('Remote branches:', remoteBranches);
    console.log('Deprecated branches to delete:', staleBranches.map(b => b.name));
    
    if (staleBranches.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No deprecated branches to remove.' 
      });
    }
    
    // Delete each stale branch
    const results = [];
    const errors = [];
    
    for (const branch of staleBranches) {
      // Try normal delete first
      let deleteResult = await runGitCommand(`git branch -d ${branch.name}`);
      
      // If that fails, try force delete
      if (!deleteResult.success) {
        console.log(`Normal delete failed for ${branch.name}, trying force delete`);
        deleteResult = await runGitCommand(`git branch -D ${branch.name}`);
      }
      
      if (deleteResult.success) {
        results.push(`Deleted branch ${branch.name}`);
      } else {
        errors.push(`Failed to delete ${branch.name}: ${deleteResult.error}`);
      }
    }
    
    if (errors.length > 0) {
      console.error('Errors during cleanup:', errors);
    }
    
    const message = results.length > 0 
      ? `${results.join('\n')}\n${results.length} deprecated branches removed.`
      : 'No branches were removed.';
    
    res.json({ 
      success: true, 
      message: message,
      warnings: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to clean up branches: ${error.message}` 
    });
  }
});

// Status endpoint (optional)
app.get('/status', async (req, res) => {
  try {
    const result = await runGitCommand('git status');
    
    if (result.success) {
      res.json({ success: true, status: result.output });
    } else {
      console.error('Status command failed:', result.error);
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ success: false, message: `Failed to get status: ${error.message}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Git Branch Manager Backend running on port ${PORT}`);
  console.log(`Using repository at: ${path.resolve(config.repositoryPath)}`);
});
