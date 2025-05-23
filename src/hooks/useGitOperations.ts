
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
  updateAllBranches,
  cleanupBranches,
  searchBranches,
  BranchUpdateResult
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
  const [isUpdatingAllBranches, setIsUpdatingAllBranches] = useState<boolean>(false);

  // Load initial set or reset branches with optimization for skipping refresh
  const fetchLocalBranches = useCallback(async (reset = true) => {
    try {
      setIsLoading(true);
      
      // If reset, start from page 0, otherwise continue with next page
      const page = reset ? 0 : localBranchesPage;
      
      // Add skipRefresh parameter to avoid unnecessary git operations
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

  // Load remote branches with pagination and optimization
  const fetchRemoteBranches = useCallback(async (reset = true) => {
    try {
      const page = reset ? 0 : remoteBranchesPage;
      // Load branches in groups of 10 with skipRefresh for faster subsequent calls
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
      const output = await switchBranch(branchName, config.apiBaseUrl);
      setGitOutput(output); // Always display the real output, whether success or error
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsLoading(false);
      
      if (opts && opts.imported) {
        toast.success(`Local branch created: ${branchName}`, {
          description: 'Branch imported from remote successfully.',
        });
      } else {
        toast.success(`Switched to branch: ${branchName}`, {
          description: 'Branch change was successful.',
        });
      }
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsLoading(false);
      
      // Make sure to display the error in the output panel
      if (error instanceof Error) {
        setGitOutput(error.message);
      }
      
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
      
      const output = await deleteBranch(branchName, config.apiBaseUrl);
      setGitOutput(output); // Always display the real output, whether success or error
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsLoading(false);
      toast.success(`Deleted ${branchName}`);
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsLoading(false);
      
      // Make sure to display the error in the output panel
      if (error instanceof Error) {
        setGitOutput(error.message);
      }
      
      toast.error(`Failed to delete ${branchName}`);
      fetchLocalBranches(true);
    }
  };

  const handleUpdateCurrentBranch = async () => {
    setIsLoading(true);
    setGitOutput('');
    try {
      const output = await updateCurrentBranch(config.apiBaseUrl);
      setGitOutput(output); // Always display the real output, whether success or error
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsLoading(false);
      
      // Only show success toast if we don't have error output
      if (!output.includes('error:') && !output.includes('fatal:')) {
        toast.success('Branch updated successfully', {
          description: 'The current branch has been updated.',
        });
      } else {
        toast.error('Failed to update branch', {
          description: 'See output panel for details.',
        });
      }
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsLoading(false);
      
      // Make sure to display the error in the output panel
      if (error instanceof Error) {
        setGitOutput(error.message);
      }
      
      toast.error('Failed to update branch', {
        description: 'See output panel for details.',
      });
    }
  };

  const handleUpdateAllBranches = async () => {
    setIsUpdatingAllBranches(true);
    setGitOutput('');
    try {
      const result = await updateAllBranches(config.apiBaseUrl);
      
      // Format the output to display in the GitOutput component
      let formattedOutput = "Updating all branches:\n\n";
      let successCount = 0;
      
      result.results.forEach(branchResult => {
        if (branchResult.success) {
          successCount++;
          formattedOutput += `✅ ${branchResult.branch}: ${branchResult.output.trim()}\n\n`;
        } else {
          formattedOutput += `❌ ${branchResult.branch}: ${branchResult.output.trim()}\n\n`;
        }
      });
      
      formattedOutput += `\nSummary: ${successCount} of ${result.results.length} branches updated successfully.`;
      
      setGitOutput(formattedOutput);
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsUpdatingAllBranches(false);
      
      if (result.overallSuccess) {
        toast.success('All branches updated', {
          description: `${successCount} of ${result.results.length} branches updated successfully.`,
        });
      } else {
        toast.warning('Some branches failed to update', {
          description: `${successCount} of ${result.results.length} branches updated successfully.`,
        });
      }
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsUpdatingAllBranches(false);
      
      // Make sure to display the error in the output panel
      if (error instanceof Error) {
        setGitOutput(error.message);
      }
      
      toast.error('Failed to update branches');
    }
  };

  const handleCleanupBranches = async () => {
    setIsLoading(true);
    setGitOutput('');
    try {
      const output = await cleanupBranches(config.apiBaseUrl);
      setGitOutput(output); // Always display the real output, whether success or error
      
      // Important: Set loading to false IMMEDIATELY before showing the toast
      setIsLoading(false);
      
      // Only show success toast if we don't have error output
      if (!output.includes('error:') && !output.includes('fatal:')) {
        toast.success('Deprecated branches removed');
      } else {
        toast.error('Failed to clean up branches', {
          description: 'See output panel for details.',
        });
      }
      
      // Refresh local branches in the background without blocking UI
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      // Important: Set loading to false immediately in case of error
      setIsLoading(false);
      
      // Make sure to display the error in the output panel
      if (error instanceof Error) {
        setGitOutput(error.message);
      }
      
      toast.error('Failed to clean up branches', {
        description: 'See output panel for details.',
      });
    }
  };

  // Optimized search with debounce
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
    isUpdatingAllBranches,
    fetchLocalBranches,
    fetchMoreLocalBranches,
    fetchRemoteBranches,
    fetchMoreRemoteBranches,
    handleSwitchBranch,
    handleDeleteBranch,
    handleUpdateCurrentBranch,
    handleUpdateAllBranches,
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
