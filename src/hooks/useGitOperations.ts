
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Branch } from '@/components/BranchList';
import { RemoteBranch } from '@/components/BranchSearch';
import { useConfig } from '@/contexts/ConfigContext';
import { 
  getLocalBranches, 
  getRemoteBranches, 
  switchBranch, 
  deleteBranch, 
  updateCurrentBranch,
  cleanupBranches,
  searchBranches,
  GitOperationResponse
} from '@/services/gitService';

export const useGitOperations = () => {
  const { config } = useConfig();
  const [localBranches, setLocalBranches] = useState<Branch[]>([]);
  const [remoteBranches, setRemoteBranches] = useState<RemoteBranch[]>([]);
  const [gitOutput, setGitOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localBranchesPage, setLocalBranchesPage] = useState<number>(0);
  const [remoteBranchesPage, setRemoteBranchesPage] = useState<number>(0);
  const [localBranchesHasMore, setLocalBranchesHasMore] = useState<boolean>(true);
  const [remoteBranchesHasMore, setRemoteBranchesHasMore] = useState<boolean>(true);
  const [localBranchesTotal, setLocalBranchesTotal] = useState<number>(0);
  const [remoteBranchesTotal, setRemoteBranchesTotal] = useState<number>(0);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  // Load initial set or reset branches
  const fetchLocalBranches = useCallback(async (reset = true) => {
    try {
      setIsLoading(true);
      
      // If reset, start from page 0, otherwise continue with next page
      const page = reset ? 0 : localBranchesPage;
      
      // Load branches in groups of 10
      const response = await getLocalBranches(page, 10, config.apiBaseUrl);
      
      if (reset) {
        setLocalBranches(response.branches);
      } else {
        setLocalBranches(prev => [...prev, ...response.branches]);
      }
      
      // Update pagination state
      setLocalBranchesPage(page + 1);
      setLocalBranchesHasMore(response.pagination.hasMore);
      setLocalBranchesTotal(response.pagination.total);
      
      setIsLoading(false);
      return response;
    } catch (error) {
      toast.error('Failed to load local branches');
      setIsLoading(false);
      return null;
    }
  }, [localBranchesPage, config.apiBaseUrl]);

  // Load more local branches on scroll
  const fetchMoreLocalBranches = async () => {
    if (isLoading || !localBranchesHasMore) return;
    await fetchLocalBranches(false);
  };

  const triggerReloadLocalBranches = () => {
    setReloadTrigger(prev => prev + 1);
    fetchLocalBranches(true);
  };

  // Load remote branches with pagination
  const fetchRemoteBranches = useCallback(async (reset = true) => {
    try {
      const page = reset ? 0 : remoteBranchesPage;
      // Load branches in groups of 10
      const response = await getRemoteBranches(page, 10, config.apiBaseUrl);
      
      if (reset) {
        setRemoteBranches(response.branches);
      } else {
        setRemoteBranches(prev => [...prev, ...response.branches]);
      }
      
      setRemoteBranchesPage(page + 1);
      setRemoteBranchesHasMore(response.pagination.hasMore);
      setRemoteBranchesTotal(response.pagination.total);
      
      return response;
    } catch (error) {
      toast.error('Failed to load remote branches');
      return null;
    }
  }, [remoteBranchesPage, config.apiBaseUrl]);

  const fetchMoreRemoteBranches = async () => {
    if (isLoading || !remoteBranchesHasMore) return;
    await fetchRemoteBranches(false);
  };

  const handleSwitchBranch = async (branchName: string, opts?: { imported?: boolean }) => {
    // Set loading state before operation
    setIsLoading(true);
    setGitOutput('');
    
    try {
      // Optimistically update UI before API call completes
      const updatedBranches = localBranches.map(branch => ({
        ...branch,
        isCurrent: branch.name === branchName
      }));
      
      setLocalBranches(updatedBranches);
      
      // Perform the operation
      const output: GitOperationResponse = await switchBranch(branchName, config.apiBaseUrl);
      
      // Always display the complete output (stdout or stderr) to the user, ensuring we never have a blank output
      const displayOutput = output.stdout || output.stderr || 'Command completed with no output';
      setGitOutput(displayOutput);
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsLoading(false);
      
      if (output.success) {
        if (opts && opts.imported) {
          toast.success(`Local branch created: ${branchName}`, {
            description: 'Branch imported from remote successfully.',
          });
        } else {
          toast.success(`Switched to branch: ${branchName}`, {
            description: 'Branch change was successful.',
          });
        }
      } else {
        // Show an error toast with a more generic message
        toast.error(`Failed to switch to ${branchName}`);
      }
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setGitOutput(errorMessage);
      toast.error(`Failed to switch to ${branchName}`);
      fetchLocalBranches(true);
    }
  };

  const handleDeleteBranch = async (branchName: string) => {
    setIsLoading(true);
    setGitOutput('');
    
    try {
      // Optimistically remove the branch from UI
      setLocalBranches(prevBranches => 
        prevBranches.filter(branch => branch.name !== branchName)
      );
      
      const output: GitOperationResponse = await deleteBranch(branchName, config.apiBaseUrl);
      
      // Always display the complete output (stdout or stderr) to the user
      const displayOutput = output.stdout || output.stderr || 'Command completed with no output';
      setGitOutput(displayOutput);
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsLoading(false);
      
      if (output.success) {
        toast.success(`Deleted ${branchName}`);
      } else {
        // Show the error output
        toast.error(`Failed to delete ${branchName}`);
      }
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setGitOutput(errorMessage);
      toast.error(`Failed to delete ${branchName}`);
      fetchLocalBranches(true);
    }
  };

  const handleUpdateCurrentBranch = async () => {
    setIsLoading(true);
    setGitOutput('');
    try {
      const output: GitOperationResponse = await updateCurrentBranch(config.apiBaseUrl);
      
      // Always display the complete output (stdout or stderr) to the user
      const displayOutput = output.stdout || output.stderr || 'Command completed with no output';
      setGitOutput(displayOutput);
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsLoading(false);
      
      if (output.success) {
        toast.success('Branch updated successfully', {
          description: 'The current branch has been updated.',
        });
      } else {
        // Show the error output
        toast.error('Failed to update branch');
      }
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setGitOutput(errorMessage);
      toast.error('Failed to update branch');
    }
  };

  const handleCleanupBranches = async () => {
    setIsLoading(true);
    setGitOutput('');
    try {
      const output: GitOperationResponse = await cleanupBranches(config.apiBaseUrl);
      
      // Always display the complete output (stdout or stderr) to the user
      const displayOutput = output.stdout || output.stderr || 'Command completed with no output';
      setGitOutput(displayOutput);
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsLoading(false);
      
      if (output.success) {
        toast.success('Deprecated branches removed');
      } else {
        // Show the error output
        toast.error('Failed to clean up branches');
      }
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setGitOutput(errorMessage);
      toast.error('Failed to clean up branches');
    }
  };

  const handleSearch = async (query: string) => {
    try {
      if (query.trim() === '') {
        // If query is empty, fetch first page of remote branches
        fetchRemoteBranches(true);
        return;
      }
      
      // For actual search queries, use the search endpoint
      const response = await searchBranches(query, 0, 20, config.apiBaseUrl);
      setRemoteBranches(response.branches);
      setRemoteBranchesHasMore(response.pagination.hasMore);
      setRemoteBranchesTotal(response.pagination.total);
      setRemoteBranchesPage(1);
    } catch (error) {
      // Silent error handling
    }
  };

  return {
    localBranches,
    remoteBranches,
    gitOutput,
    isLoading,
    fetchLocalBranches,
    fetchMoreLocalBranches,
    fetchRemoteBranches,
    fetchMoreRemoteBranches,
    handleSwitchBranch,
    handleDeleteBranch,
    handleUpdateCurrentBranch,
    handleCleanupBranches,
    handleSearch,
    localBranchesHasMore,
    remoteBranchesHasMore,
    localBranchesTotal,
    remoteBranchesTotal,
    triggerReloadLocalBranches,
    reloadTrigger
  };
};
