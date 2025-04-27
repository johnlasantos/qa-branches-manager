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
  searchBranches
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

  const fetchLocalBranches = useCallback(async (reset = true) => {
    try {
      setIsLoading(true);
      
      // If reset, start from page 0, otherwise continue with next page
      const page = reset ? 0 : localBranchesPage;
      
      const response = await getLocalBranches(page, 20, config.apiBaseUrl);
      
      if (reset) {
        setLocalBranches(response.branches);
      } else {
        setLocalBranches(prev => [...prev, ...response.branches]);
      }
      
      // Update pagination state
      setLocalBranchesPage(page + 1);
      setLocalBranchesHasMore(response.pagination.hasMore);
      setLocalBranchesTotal(response.pagination.total);
      
      return response;
    } catch (error) {
      toast.error('Failed to load local branches');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [localBranchesPage, config.apiBaseUrl]);

  const fetchMoreLocalBranches = async () => {
    if (isLoading || !localBranchesHasMore) return;
    await fetchLocalBranches(false);
  };

  const fetchRemoteBranches = useCallback(async (reset = true) => {
    try {
      const page = reset ? 0 : remoteBranchesPage;
      const response = await getRemoteBranches(page, 20, config.apiBaseUrl);
      
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
      console.error(error);
      return null;
    }
  }, [remoteBranchesPage, config.apiBaseUrl]);

  const fetchMoreRemoteBranches = async () => {
    if (isLoading || !remoteBranchesHasMore) return;
    await fetchRemoteBranches(false);
  };

  const handleSwitchBranch = async (branchName: string, opts?: { imported?: boolean }) => {
    setIsLoading(true);
    setGitOutput('');
    
    try {
      const output = await switchBranch(branchName, config.apiBaseUrl);
      setGitOutput(output);
      
      if (opts && opts.imported) {
        toast.success(`Local branch created: ${branchName}`, {
          description: 'Branch imported from remote successfully.',
        });
      } else {
        toast.success(`Switched to branch: ${branchName}`, {
          description: 'Branch change was successful.',
        });
      }
      
      const updatedBranches = localBranches.map(branch => ({
        ...branch,
        isCurrent: branch.name === branchName
      }));
      
      setLocalBranches(updatedBranches);
      
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      toast.error(`Failed to switch to ${branchName}`);
      console.error(error);
      fetchLocalBranches(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async (branchName: string) => {
    setIsLoading(true);
    setGitOutput('');
    
    try {
      const output = await deleteBranch(branchName, config.apiBaseUrl);
      setGitOutput(output);
      
      setLocalBranches(prevBranches => 
        prevBranches.filter(branch => branch.name !== branchName)
      );
      
      toast.success(`Deleted ${branchName}`);
      
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      toast.error(`Failed to delete ${branchName}`);
      console.error(error);
      fetchLocalBranches(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCurrentBranch = async () => {
    setIsLoading(true);
    setGitOutput('');
    try {
      const output = await updateCurrentBranch(config.apiBaseUrl);
      setGitOutput(output);
      
      toast.success('Branch updated successfully', {
        description: 'The current branch has been updated.',
      });
      
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      toast.error('Failed to update branch');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupBranches = async () => {
    setIsLoading(true);
    setGitOutput('');
    try {
      const output = await cleanupBranches(config.apiBaseUrl);
      setGitOutput(output);
      
      toast.success('Stale branches removed');
      
      setTimeout(() => {
        fetchLocalBranches(true);
      }, 100);
    } catch (error) {
      toast.error('Failed to clean up branches');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await searchBranches(query, 0, 10, config.apiBaseUrl);
      setRemoteBranches(response.branches);
      setRemoteBranchesHasMore(response.pagination.hasMore);
      setRemoteBranchesTotal(response.pagination.total);
      setRemoteBranchesPage(1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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
  };
};
