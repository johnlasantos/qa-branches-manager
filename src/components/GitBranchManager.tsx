
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Separator } from '@/components/ui/separator';
import GitHeader from '@/components/GitHeader';
import TopProgressBar from './TopProgressBar';
import Footer from './Footer';
import { useGitOperations } from '@/hooks/useGitOperations';
import { useConfig } from '@/contexts/ConfigContext';

// Lazy load components that aren't needed for initial render
const BranchList = lazy(() => import('@/components/BranchList'));
const BranchSearch = lazy(() => import('@/components/BranchSearch'));
const GitOutput = lazy(() => import('@/components/GitOutput'));
const BranchCleanupButton = lazy(() => import('./BranchCleanupButton'));
const UpdateAllBranchesButton = lazy(() => import('./UpdateAllBranchesButton'));

const GitBranchManager: React.FC = () => {
  const { config } = useConfig();
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
  } = useGitOperations();
  
  const [isUpdatingCurrentBranch, setIsUpdatingCurrentBranch] = useState(false);
  const hasLocalBranches = localBranches.length > 0 || isLoading;

  useEffect(() => {
    // Only fetch data if configuration is loaded
    if (config.isLoaded) {
      // Use a small delay to prioritize rendering the UI first
      const timeoutId = setTimeout(() => {
        fetchLocalBranches();
        fetchRemoteBranches();
      }, 100);
      
      return () => clearTimeout(timeoutId);
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
            <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded" />}>
              <BranchSearch 
                remoteBranches={remoteBranches}
                localBranches={localBranches}
                onSearch={handleSearch}
                onSelectRemoteBranch={handleSwitchBranch}
                onScrollEnd={fetchMoreRemoteBranches}
              />
            </Suspense>
            
            <Separator className="my-4" />
            
            {/* Local Branches */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold whitespace-nowrap mr-4">Local Branches</h2>
              {hasLocalBranches && (
                <div className="flex items-center">
                  <Suspense fallback={<div className="w-16 h-8 bg-gray-100 animate-pulse rounded" />}>
                    <BranchCleanupButton 
                      onCleanup={handleCleanupBranches} 
                      isLoading={isLoading}
                      isUpdatingAllBranches={isUpdatingAllBranches}
                    />
                  </Suspense>
                  <Suspense fallback={<div className="w-16 h-8 ml-2 bg-gray-100 animate-pulse rounded" />}>
                    <UpdateAllBranchesButton 
                      onUpdateAllBranches={handleUpdateAllBranches} 
                      isUpdating={isUpdatingAllBranches} 
                    />
                  </Suspense>
                </div>
              )}
            </div>
            
            <Suspense fallback={<div className="flex-1 bg-gray-100 animate-pulse rounded" />}>
              <BranchList 
                branches={localBranches}
                onSwitchBranch={handleSwitchBranch}
                onDeleteBranch={handleDeleteBranch}
                onUpdateCurrentBranch={updateCurrentBranchWithTracking}
                isLoading={isLoading}
                isUpdatingCurrentBranch={isUpdatingCurrentBranch}
                isUpdatingAllBranches={isUpdatingAllBranches}
                updatingBranches={updatingBranches}
                onScrollEnd={fetchMoreLocalBranches}
                hasMore={localBranchesHasMore}
                className="flex-1 overflow-hidden"
              />
            </Suspense>
          </div>
          
          {/* Column 2: Command Output */}
          <div className="lg:col-span-2 overflow-hidden flex flex-col h-full">
            <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse rounded" />}>
              <GitOutput output={gitOutput} />
            </Suspense>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default GitBranchManager;
