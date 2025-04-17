
import React, { useState, useEffect } from 'react';
import GitHeader from '@/components/GitHeader';
import BranchList, { Branch } from '@/components/BranchList';
import BranchSearch, { RemoteBranch } from '@/components/BranchSearch';
import GitOutput from '@/components/GitOutput';
import ActionButtons from '@/components/ActionButtons';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  getLocalBranches, 
  getRemoteBranches, 
  switchBranch, 
  deleteBranch, 
  updateCurrentBranch, 
  cleanupBranches,
  searchBranches
} from '@/services/gitService';

const Index = () => {
  const [localBranches, setLocalBranches] = useState<Branch[]>([]);
  const [remoteBranches, setRemoteBranches] = useState<RemoteBranch[]>([]);
  const [gitOutput, setGitOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');

  useEffect(() => {
    // Load initial data
    fetchLocalBranches();
    fetchRemoteBranches();
  }, []);

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
      
      // Update branch list after switching
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
      
      // Update branch list after deletion
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
      
      // Update branch list after pull
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
      
      // Update branch list after cleanup
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
    setFilterQuery(query);
    
    try {
      const branches = await searchBranches(query);
      setRemoteBranches(branches);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectRemoteBranch = (branchName: string) => {
    handleSwitchBranch(branchName);
  };

  // Filter local branches based on search query
  const filteredLocalBranches = filterQuery
    ? localBranches.filter(branch => 
        branch.name.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : localBranches;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <GitHeader />
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border">
          <div className="flex flex-col space-y-4">
            <ActionButtons 
              onUpdateCurrentBranch={handleUpdateCurrentBranch}
              onCleanupBranches={handleCleanupBranches}
              isLoading={isLoading}
            />
            
            <div className="pt-2">
              <BranchSearch 
                remoteBranches={remoteBranches}
                onSearch={handleSearch}
                onSelectRemoteBranch={handleSelectRemoteBranch}
              />
            </div>
            
            <Separator className="my-4" />
            
            <h2 className="text-xl font-semibold">Local Branches</h2>
            <BranchList 
              branches={filteredLocalBranches}
              onSwitchBranch={handleSwitchBranch}
              onDeleteBranch={handleDeleteBranch}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        <GitOutput output={gitOutput} />
      </div>
    </div>
  );
};

export default Index;
