
import React, { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import GitHeader from '@/components/GitHeader';
import BranchList from '@/components/BranchList';
import BranchSearch from '@/components/BranchSearch';
import GitOutput from '@/components/GitOutput';
import BranchCleanupButton from './BranchCleanupButton';
import { useGitOperations } from '@/hooks/useGitOperations';
import { useConfig } from '@/contexts/ConfigContext';

const GitBranchManager: React.FC = () => {
  const { config } = useConfig();
  const {
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
  } = useGitOperations();

  useEffect(() => {
    // Only fetch data if configuration is loaded
    if (config.isLoaded) {
      fetchLocalBranches();
      fetchRemoteBranches();
    }
  }, [config.isLoaded]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <GitHeader />
      
      <div className="pt-2">
        <BranchSearch 
          remoteBranches={remoteBranches}
          localBranches={localBranches}
          onSearch={handleSearch}
          onSelectRemoteBranch={handleSwitchBranch}
          onScrollEnd={fetchMoreRemoteBranches}
        />
      </div>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Local Branches</h2>
            <BranchCleanupButton onCleanup={handleCleanupBranches} isLoading={isLoading} />
          </div>
          
          <BranchList 
            branches={localBranches}
            onSwitchBranch={handleSwitchBranch}
            onDeleteBranch={handleDeleteBranch}
            onUpdateCurrentBranch={handleUpdateCurrentBranch}
            isLoading={isLoading}
            onScrollEnd={fetchMoreLocalBranches}
            hasMore={localBranchesHasMore}
          />
        </div>
        
        <div className="lg:col-span-1">
          <GitOutput output={gitOutput} className="h-full" />
        </div>
      </div>
    </div>
  );
};

export default GitBranchManager;
