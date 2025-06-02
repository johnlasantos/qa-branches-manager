import React, { useEffect } from 'react';
import BranchList from '@/components/BranchList';
import BranchSearch from '@/components/BranchSearch';
import GitOutput from '@/components/GitOutput';
import GitHeader from '@/components/GitHeader';
import { useGitOperations } from '@/hooks/useGitOperations';

const GitBranchManager: React.FC = () => {
  const {
    localBranches,
    remoteBranches,
    gitOutput,
    isLoading,
    isUpdatingAllBranches,
    updatingBranches,
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
  } = useGitOperations();

  useEffect(() => {
    fetchLocalBranches(true);
    fetchRemoteBranches(true);
  }, [fetchLocalBranches, fetchRemoteBranches, reloadTrigger]);

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col border-r">
        <GitHeader
          localBranchesTotal={localBranchesTotal}
          remoteBranchesTotal={remoteBranchesTotal}
          onUpdateAllBranches={handleUpdateAllBranches}
          onCleanupBranches={handleCleanupBranches}
          isUpdatingAllBranches={isUpdatingAllBranches}
          isLoading={isLoading}
          onReloadLocalBranches={triggerReloadLocalBranches}
        />
        
        <div className="flex-1 overflow-hidden">
          <BranchList
            branches={localBranches}
            onSwitchBranch={handleSwitchBranch}
            onDeleteBranch={handleDeleteBranch}
            onUpdateCurrentBranch={handleUpdateCurrentBranch}
            onScrollEnd={fetchMoreLocalBranches}
            hasMore={localBranchesHasMore}
            className="h-full"
            isLoading={isLoading}
            isUpdatingCurrentBranch={isLoading}
            isUpdatingAllBranches={isUpdatingAllBranches}
            updatingBranches={updatingBranches}
            onReloadLocalBranches={triggerReloadLocalBranches}
          />
        </div>
      </div>
      
      <div className="w-1/2 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <BranchSearch
            branches={remoteBranches}
            onSwitchBranch={handleSwitchBranch}
            onSearch={handleSearch}
            onScrollEnd={fetchMoreRemoteBranches}
            hasMore={remoteBranchesHasMore}
            className="h-full"
          />
        </div>
        
        <div className="border-t">
          <GitOutput output={gitOutput} />
        </div>
      </div>
    </div>
  );
};

export default GitBranchManager;
