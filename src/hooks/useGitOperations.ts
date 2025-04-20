
import { useState } from 'react';
import { toast } from 'sonner';
import { Branch } from '@/components/BranchList';
import { RemoteBranch } from '@/components/BranchSearch';
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
  const [localBranches, setLocalBranches] = useState<Branch[]>([]);
  const [remoteBranches, setRemoteBranches] = useState<RemoteBranch[]>([]);
  const [gitOutput, setGitOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLocalBranches = async () => {
    try {
      const branches = await getLocalBranches();
      setLocalBranches(branches);
    } catch (error) {
      toast.error('Failed to load local branches');
      console.error(error);
    }
  };

  const fetchRemoteBranches = async () => {
    try {
      const branches = await getRemoteBranches();
      setRemoteBranches(branches);
    } catch (error) {
      toast.error('Failed to load remote branches');
      console.error(error);
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    setIsLoading(true);
    setGitOutput('');
    
    try {
      const output = await switchBranch(branchName);
      setGitOutput(output);
      await fetchLocalBranches();
      toast.success(`Switched to ${branchName}`);
    } catch (error) {
      toast.error(`Failed to switch to ${branchName}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async (branchName: string) => {
    setIsLoading(true);
    setGitOutput('');
    
    try {
      const output = await deleteBranch(branchName);
      setGitOutput(output);
      await fetchLocalBranches();
      toast.success(`Deleted ${branchName}`);
    } catch (error) {
      toast.error(`Failed to delete ${branchName}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCurrentBranch = async () => {
    setIsLoading(true);
    setGitOutput('');
    
    try {
      const output = await updateCurrentBranch();
      setGitOutput(output);
      await fetchLocalBranches();
      toast.success('Branch updated successfully');
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
      const output = await cleanupBranches();
      setGitOutput(output);
      await fetchLocalBranches();
      toast.success('Stale branches removed');
    } catch (error) {
      toast.error('Failed to clean up branches');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const branches = await searchBranches(query);
      setRemoteBranches(branches);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    localBranches,
    remoteBranches,
    gitOutput,
    isLoading,
    fetchLocalBranches,
    fetchRemoteBranches,
    handleSwitchBranch,
    handleDeleteBranch,
    handleUpdateCurrentBranch,
    handleCleanupBranches,
    handleSearch,
  };
};
