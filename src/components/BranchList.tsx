import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, ArrowLeftRight, Trash2, Search, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import BranchIcon from './BranchIcon';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export interface Branch {
  name: string;
  isCurrent?: boolean;
  current?: boolean;
  hasRemote: boolean;
}

interface BranchListProps {
  branches: Branch[];
  onSwitchBranch: (branchName: string) => void;
  onDeleteBranch: (branchName: string) => void;
  onUpdateCurrentBranch: () => void;
  onScrollEnd?: () => void;
  hasMore?: boolean;
  className?: string;
  isLoading?: boolean;
  isUpdatingCurrentBranch?: boolean;
  isUpdatingAllBranches?: boolean;
  updatingBranches?: Set<string>;
  onReloadLocalBranches?: () => void;
}

const BranchList: React.FC<BranchListProps> = ({ 
  branches: unsortedBranches, 
  onSwitchBranch, 
  onDeleteBranch,
  onUpdateCurrentBranch,
  onScrollEnd,
  hasMore = false,
  className,
  isLoading = false,
  isUpdatingCurrentBranch = false,
  isUpdatingAllBranches = false,
  updatingBranches = new Set(),
  onReloadLocalBranches
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [switchDialogBranch, setSwitchDialogBranch] = useState<string | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);
  const [openTooltips, setOpenTooltips] = useState<Record<string, boolean>>({});
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Determine if any action buttons should be disabled
  const areActionsDisabled = isLoading || isUpdatingCurrentBranch || isUpdatingAllBranches;

  useEffect(() => {
    if (areActionsDisabled) {
      setOpenTooltips({});
    }
  }, [areActionsDisabled]);

  const handleTooltipOpenChange = (open: boolean, tooltipId: string) => {
    if (areActionsDisabled) return;
    
    setOpenTooltips(prev => ({
      ...prev,
      [tooltipId]: open
    }));
  };

  const sortBranches = (branches: Branch[]) => {
    const orderMap = { main: 0, master: 1, develop: 2, staging: 3 };
    return [...branches].sort((a, b) => {
      const aOrder = orderMap[a.name as keyof typeof orderMap] ?? 999;
      const bOrder = orderMap[b.name as keyof typeof orderMap] ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
  };

  const branches = sortBranches(unsortedBranches);
  const hasBranches = branches.length > 0 || isLoading;

  const normalizedBranches = branches.map(branch => ({
    ...branch,
    isCurrent: branch.isCurrent !== undefined ? branch.isCurrent : branch.current,
  }));

  const filteredBranches = normalizedBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const setupIntersectionObserver = useCallback(() => {
    if (!hasMore || !onScrollEnd || !loadingRef.current) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          onScrollEnd();
        }
      },
      { threshold: 0.5 }
    );
    
    observer.current.observe(loadingRef.current);
  }, [hasMore, onScrollEnd, isLoading]);

  useEffect(() => {
    setupIntersectionObserver();
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [setupIntersectionObserver, filteredBranches.length]);

  if (isLoading && branches.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-14 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (branches.length === 0 && !isLoading) {
    return (
      <div className={cn("w-full p-4 text-center text-gray-500", className)}>
        No branches found
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col", className)}>
      {hasBranches && (
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search local branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
              disabled={areActionsDisabled}
            />
          </div>
        </div>
      )}

      <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-24rem)] overflow-auto pr-2 flex-1">
        <div className="space-y-2">
          {filteredBranches.map((branch) => {
            const isBranchUpdating = updatingBranches.has(branch.name);
            
            return (
              <div 
                key={branch.name}
                className={cn(
                  "branch-item p-3 rounded-md border", 
                  branch.isCurrent 
                    ? "border-green-300 bg-green-50 hover:bg-green-50"
                    : "border-gray-200",
                  !areActionsDisabled && !branch.isCurrent && "hover:bg-gray-50",
                  areActionsDisabled && "opacity-75"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BranchIcon branchName={branch.name} hasRemote={branch.hasRemote} />
                    <span className={cn(
                      "font-medium", 
                      branch.isCurrent ? "font-semibold" : "",
                      !branch.hasRemote ? "line-through text-gray-500" : ""
                    )}>
                      {branch.name}
                      {branch.isCurrent && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">current</span>}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {branch.isCurrent ? (
                      // Only show update button if the branch has a remote counterpart
                      branch.hasRemote && (
                        <TooltipProvider>
                          <Tooltip 
                            open={openTooltips[`update-${branch.name}`]} 
                            onOpenChange={(open) => handleTooltipOpenChange(open, `update-${branch.name}`)}
                          >
                            <TooltipTrigger asChild>
                              <span>
                                <AlertDialog 
                                  open={showUpdateDialog} 
                                  onOpenChange={(isOpen) => {
                                    if (areActionsDisabled) return;
                                    setShowUpdateDialog(isOpen);
                                    if (!isOpen) {
                                      setOpenTooltips(prev => ({ 
                                        ...prev, 
                                        [`update-${branch.name}`]: false 
                                      }));
                                    }
                                  }}
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      onClick={() => {
                                        if (areActionsDisabled) return;
                                        setShowUpdateDialog(true);
                                        setOpenTooltips(prev => ({ 
                                          ...prev, 
                                          [`update-${branch.name}`]: false 
                                        }));
                                      }}
                                      variant="secondary"
                                      className="flex items-center bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                                      disabled={areActionsDisabled || isBranchUpdating}
                                    >
                                      <RefreshCcw size={16} className={isUpdatingCurrentBranch || isUpdatingAllBranches || isBranchUpdating ? "animate-spin" : ""} />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Update current branch?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will fetch and update the current branch from its remote counterpart.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => {
                                        setOpenTooltips(prev => ({ 
                                          ...prev, 
                                          [`update-${branch.name}`]: false 
                                        }));
                                      }}>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          setShowUpdateDialog(false);
                                          setOpenTooltips(prev => ({ 
                                            ...prev, 
                                            [`update-${branch.name}`]: false 
                                          }));
                                          onUpdateCurrentBranch();
                                        }}
                                      >
                                        Update
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update this branch</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    ) : (
                      <>
                        <TooltipProvider>
                          <Tooltip 
                            open={openTooltips[`delete-${branch.name}`]} 
                            onOpenChange={(open) => handleTooltipOpenChange(open, `delete-${branch.name}`)}
                          >
                            <TooltipTrigger asChild>
                              <span>
                                <AlertDialog onOpenChange={(isOpen) => {
                                  if (areActionsDisabled) return;
                                  if (!isOpen) {
                                    setOpenTooltips(prev => ({
                                      ...prev,
                                      [`delete-${branch.name}`]: false
                                    }));
                                  }
                                }}>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="secondary" 
                                      size="sm"
                                      onClick={() => {
                                        if (areActionsDisabled) return;
                                        setOpenTooltips(prev => ({
                                          ...prev,
                                          [`delete-${branch.name}`]: false
                                        }));
                                      }}
                                      className="flex items-center bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                                      disabled={areActionsDisabled || isBranchUpdating}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure you want to delete <span className="font-mono">{branch.name}</span>?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the branch.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          setOpenTooltips(prev => ({
                                            ...prev,
                                            [`delete-${branch.name}`]: false
                                          }));
                                          onDeleteBranch(branch.name);
                                        }}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete this branch</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip 
                            open={openTooltips[`switch-${branch.name}`]} 
                            onOpenChange={(open) => handleTooltipOpenChange(open, `switch-${branch.name}`)}
                          >
                            <TooltipTrigger asChild>
                              <span>
                                <AlertDialog 
                                  open={switchDialogBranch === branch.name} 
                                  onOpenChange={(isOpen) => {
                                    if (areActionsDisabled) return;
                                    setSwitchDialogBranch(isOpen ? branch.name : null);
                                    if (!isOpen) {
                                      setOpenTooltips(prev => ({
                                        ...prev,
                                        [`switch-${branch.name}`]: false
                                      }));
                                    }
                                  }}
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="secondary" 
                                      size="sm" 
                                      onClick={() => {
                                        if (areActionsDisabled) return;
                                        setSwitchDialogBranch(branch.name);
                                        setOpenTooltips(prev => ({
                                          ...prev,
                                          [`switch-${branch.name}`]: false
                                        }));
                                      }}
                                      className="flex items-center bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                                      disabled={areActionsDisabled || isBranchUpdating}
                                    >
                                      {isBranchUpdating ? (
                                        <RefreshCcw size={16} className="animate-spin" />
                                      ) : (
                                        <ArrowLeftRight size={16} />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Switch to branch <span className="font-mono">{branch.name}</span>?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        You will switch your working directory to this branch.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          setSwitchDialogBranch(null);
                                          setOpenTooltips(prev => ({
                                            ...prev,
                                            [`switch-${branch.name}`]: false
                                          }));
                                          onSwitchBranch(branch.name);
                                        }}
                                      >
                                        Switch
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Change to this branch</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </div>
                
                {!branch.hasRemote && (
                  <div className="mt-2 flex items-center text-xs text-amber-600">
                    <AlertTriangle size={14} className="mr-1" />
                    <span>This branch no longer exists on the remote.</span>
                  </div>
                )}
              </div>
            );
          })}
          
          {hasMore && (
            <div ref={loadingRef} className="py-4 flex justify-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <div className="h-5 w-5"></div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BranchList;
