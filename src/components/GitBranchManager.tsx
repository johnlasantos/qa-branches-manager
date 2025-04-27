
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import GitHeader from '@/components/GitHeader';
import BranchList from '@/components/BranchList';
import BranchSearch from '@/components/BranchSearch';
import GitOutput from '@/components/GitOutput';
import BranchCleanupButton from './BranchCleanupButton';
import LoadingOverlay from './LoadingOverlay';
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
    await handleUpdateCurrentBranch();
    setIsUpdatingCurrentBranch(false);
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <div className="container mx-auto px-4 py-6 max-w-7xl h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
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
          <div className="lg:col-span-3 overflow-hidden">
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
            />
          </div>
          
          <div className="lg:col-span-1">
            <GitOutput output={gitOutput} className="h-full" />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default GitBranchManager;
