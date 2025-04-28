
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import GitHeader from '@/components/GitHeader';
import BranchList from '@/components/BranchList';
import BranchSearch from '@/components/BranchSearch';
import GitOutput from '@/components/GitOutput';
import BranchCleanupButton from './BranchCleanupButton';
import TopProgressBar from './TopProgressBar';
import Footer from './Footer';
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
    triggerReloadLocalBranches
  } = useGitOperations();
  
  const [isUpdatingCurrentBranch, setIsUpdatingCurrentBranch] = useState(false);

  useEffect(() => {
    if (config.isLoaded) {
      fetchLocalBranches();
      fetchRemoteBranches();
    }
  }, [config.isLoaded]);

  // Custom handler for updating the current branch
  const updateCurrentBranchWithTracking = async () => {
    setIsUpdatingCurrentBranch(true);
    try {
      await handleUpdateCurrentBranch();
    } finally {
      // Ensure we set loading state to false regardless of success/failure
      setIsUpdatingCurrentBranch(false);
    }
  };

  return (
    <>
      <TopProgressBar isLoading={isLoading} />
      <div className="container mx-auto px-4 py-6 max-w-7xl h-screen flex flex-col overflow-hidden">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Local Branches</h2>
              <BranchCleanupButton onCleanup={handleCleanupBranches} isLoading={isLoading} />
            </div>
            
            <BranchList 
              branches={localBranches}
              onSwitchBranch={handleSwitchBranch}
              onDeleteBranch={handleDeleteBranch}
              onUpdateCurrentBranch={updateCurrentBranchWithTracking}
              isLoading={isLoading}
              isUpdatingCurrentBranch={isUpdatingCurrentBranch}
              onScrollEnd={fetchMoreLocalBranches}
              hasMore={localBranchesHasMore}
              onReloadLocalBranches={triggerReloadLocalBranches}
              className="flex-1 overflow-hidden"
            />
          </div>
          
          <div className="lg:col-span-1 overflow-hidden">
            <GitOutput output={gitOutput} className="h-full" />
          </div>
        </div>
        <Footer className="mt-4" />
      </div>
    </>
  );
};

export default GitBranchManager;
