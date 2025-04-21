
import React, { useState } from 'react';
import { AlertTriangle, ArrowLeftRight, Trash2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  isCurrent: boolean;
  hasRemote: boolean;
}

interface BranchListProps {
  branches: Branch[];
  onSwitchBranch: (branchName: string) => void;
  onDeleteBranch: (branchName: string) => void;
  onUpdateCurrentBranch: () => void;
  className?: string;
  isLoading?: boolean;
}

const BranchList: React.FC<BranchListProps> = ({ 
  branches, 
  onSwitchBranch, 
  onDeleteBranch,
  onUpdateCurrentBranch,
  className,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Local state to track which "switch" or "update" dialog should open
  const [switchDialogBranch, setSwitchDialogBranch] = useState<string | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={cn("w-full h-[calc(100vh-20rem)]", className)}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-14 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className={cn("w-full p-4 text-center text-gray-500", className)}>
        No branches found
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search local branches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ul className="space-y-2">
        {filteredBranches.map((branch) => (
          <li 
            key={branch.name}
            className={cn(
              "branch-item p-3 rounded-md border", 
              branch.isCurrent ? "branch-current" : "border-gray-200"
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
                  // === UPDATE BRANCH BUTTON WITH CONFIRMATION ===
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                onClick={() => setShowUpdateDialog(true)}
                                variant="secondary"
                                className="flex items-center bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                              >
                                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
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
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    setShowUpdateDialog(false);
                                    onUpdateCurrentBranch();
                                  }}
                                >
                                  Update
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Update this branch</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <>
                    {/* === SWITCH BRANCH BUTTON WITH CONFIRMATION === */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <AlertDialog open={switchDialogBranch === branch.name} onOpenChange={(open) => setSwitchDialogBranch(open ? branch.name : null)}>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={() => setSwitchDialogBranch(branch.name)}
                                  className="flex items-center bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                                >
                                  <ArrowLeftRight size={16} />
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
                                      onSwitchBranch(branch.name);
                                    }}
                                  >
                                    Switch
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Change to this branch</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {!branch.hasRemote && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  className="flex items-center bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
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
                                    onClick={() => onDeleteBranch(branch.name)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete this branch</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BranchList;
