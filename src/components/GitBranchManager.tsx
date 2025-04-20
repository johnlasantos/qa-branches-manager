
import React, { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import GitHeader from '@/components/GitHeader';
import BranchList from '@/components/BranchList';
import BranchSearch from '@/components/BranchSearch';
import GitOutput from '@/components/GitOutput';
import BranchCleanupButton from './BranchCleanupButton';
import { useGitOperations } from '@/hooks/useGitOperations';

const GitBranchManager: React.FC = () => {
  const {
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
  } = useGitOperations();

  useEffect(() => {
    fetchLocalBranches();
    fetchRemoteBranches();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <GitHeader />
      
      <div className="pt-2">
        <BranchSearch 
          remoteBranches={remoteBranches}
          onSearch={handleSearch}
          onSelectRemoteBranch={handleSwitchBranch}
        />
      </div>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Local Branches</h2>
            <BranchCleanupButton onCleanup={handleCleanupBranches} isLoading={isLoading} />
          </div>
          
          <BranchList 
            branches={localBranches}
            onSwitchBranch={handleSwitchBranch}
            onDeleteBranch={handleDeleteBranch}
            onUpdateCurrentBranch={handleUpdateCurrentBranch}
            isLoading={isLoading}
          />
        </div>
        
        <div className="lg:col-span-1">
          <GitOutput output={gitOutput} />
        </div>
      </div>
    </div>
  );
};

export default GitBranchManager;
