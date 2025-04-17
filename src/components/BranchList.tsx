
import React from 'react';
import { AlertTriangle, ArrowLeftRight, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BranchIcon from './BranchIcon';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  if (isLoading) {
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

  if (branches.length === 0) {
    return (
      <div className={cn("w-full p-4 text-center text-gray-500", className)}>
        No branches found
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ul className="space-y-2">
        {branches.map((branch) => (
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={onUpdateCurrentBranch}
                          className="flex items-center"
                        >
                          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Update this branch</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onSwitchBranch(branch.name)}
                            className="flex items-center"
                          >
                            <ArrowLeftRight size={16} />
                          </Button>
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
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => onDeleteBranch(branch.name)}
                              className="flex items-center"
                            >
                              <Trash2 size={16} />
                            </Button>
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
