
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonsProps {
  onUpdateCurrentBranch: () => void;
  onCleanupBranches: () => void;
  className?: string;
  isLoading?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onUpdateCurrentBranch, 
  onCleanupBranches,
  className,
  isLoading = false
}) => {
  return (
    <div className={cn("flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onUpdateCurrentBranch} 
              disabled={isLoading}
              className="flex items-center"
              size="lg"
            >
              <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
              <span className="ml-2">Update current branch</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update the current branch with latest changes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              onClick={onCleanupBranches}
              disabled={isLoading}
              className="flex items-center"
              size="lg"
            >
              <Trash2 className="h-5 w-5" />
              <span className="ml-2">Delete deprecated branches</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove local branches that no longer exist remotely</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ActionButtons;
