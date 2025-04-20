
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BranchCleanupButtonProps {
  onCleanup: () => void;
  isLoading: boolean;
}

const BranchCleanupButton: React.FC<BranchCleanupButtonProps> = ({ onCleanup, isLoading }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCleanup}
            disabled={isLoading}
            className="flex items-center text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 size={16} className="mr-2" />
            <span>Delete deprecated branches</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This will permanently delete local branches that no longer exist remotely</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BranchCleanupButton;
