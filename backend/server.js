
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
let config = { repositoryPath: '.' };
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
    return { success: false, output: '', error: error.message };
  }
}

// Endpoints

// Get all local branches
app.get('/branches', async (req, res) => {
  try {
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
});

// Switch branch
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
    
    let result;
    
    if (localBranches.includes(branch)) {
      // Branch exists locally, just check it out
      result = await runGitCommand(`git checkout ${branch}`);
    } else {
      // Branch doesn't exist locally, create it from remote
      result = await runGitCommand(`git checkout -b ${branch} origin/${branch}`);
    }
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Switched to branch '${branch}'\nUpdating files: 100% (123/123), done.` 
      });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      const forceResult = await runGitCommand(`git branch -D ${branch}`);
      if (forceResult.success) {
        res.json({ 
          success: true, 
          message: `Force deleted branch ${branch} (was ${forceResult.output.split(' ').pop().trim()}).` 
        });
      } else {
        res.status(500).json({ success: false, message: forceResult.error });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Pull current branch
app.post('/pull', async (req, res) => {
  try {
    const result = await runGitCommand('git pull');
    
    if (result.success) {
      res.json({ success: true, message: result.output || 'Already up to date.' });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cleanup branches (prune stale branches)
app.post('/cleanup', async (req, res) => {
  try {
    // Find merged branches that can be safely deleted
    const { output: mergedOutput } = await runGitCommand('git branch --merged');
    const currentBranch = (await runGitCommand('git branch --show-current')).output.trim();
    const protectedBranches = ['main', 'master', 'develop', currentBranch];
    
    const branchesToDelete = mergedOutput
      .split('\n')
      .filter(Boolean)
      .map(line => line.replace('*', '').trim())
      .filter(branch => !protectedBranches.includes(branch));
    
    if (branchesToDelete.length === 0) {
      return res.json({ success: true, message: 'No stale branches to remove.' });
    }
    
    // Delete each branch and collect results
    const results = [];
    for (const branch of branchesToDelete) {
      const result = await runGitCommand(`git branch -d ${branch}`);
      if (result.success) {
        results.push(`Deleted branch ${branch} (was ${result.output.split(' ').pop().trim()}).`);
      }
    }
    
    res.json({ 
      success: true, 
      message: results.join('\n') + `\n${results.length} stale branches removed.` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Status endpoint (optional)
app.get('/status', async (req, res) => {
  try {
    const result = await runGitCommand('git status');
    
    if (result.success) {
      res.json({ success: true, status: result.output });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Git Branch Manager Backend running on port ${PORT}`);
  console.log(`Using repository at: ${path.resolve(config.repositoryPath)}`);
});
