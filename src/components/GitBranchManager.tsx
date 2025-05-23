
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import GitHeader from '@/components/GitHeader';
import BranchList from '@/components/BranchList';
import BranchSearch from '@/components/BranchSearch';
import GitOutput from '@/components/GitOutput';
import BranchCleanupButton from './BranchCleanupButton';
import UpdateAllBranchesButton from './UpdateAllBranchesButton';
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
      <TopProgressBar isLoading={isLoading || isUpdatingAllBranches} />
      <div className="container mx-auto px-4 py-6 max-w-8xl h-screen flex flex-col overflow-hidden">
        <GitHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 flex-1 overflow-hidden mt-6">
          {/* Column 1: Branches Area */}
          <div className="lg:col-span-4 flex flex-col overflow-hidden">
            {/* Remote Branches Search (moved inside Column 1) */}
            <BranchSearch 
              remoteBranches={remoteBranches}
              localBranches={localBranches}
              onSearch={handleSearch}
              onSelectRemoteBranch={handleSwitchBranch}
              onScrollEnd={fetchMoreRemoteBranches}
            />
            
            <Separator className="my-4" />
            
            {/* Local Branches */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold whitespace-nowrap mr-4">Local Branches</h2>
              <div className="flex items-center">
                <BranchCleanupButton onCleanup={handleCleanupBranches} isLoading={isLoading} />
                <UpdateAllBranchesButton 
                  onUpdateAllBranches={handleUpdateAllBranches} 
                  isUpdating={isUpdatingAllBranches} 
                />
              </div>
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
          
          {/* Column 2: Command Output */}
          <div className="lg:col-span-2 overflow-hidden flex flex-col h-full">
            <GitOutput output={gitOutput} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default GitBranchManager;
