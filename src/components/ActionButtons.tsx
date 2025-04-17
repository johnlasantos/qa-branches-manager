
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <Button 
        onClick={onUpdateCurrentBranch} 
        disabled={isLoading}
        className="flex items-center"
        size="lg"
      >
        <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
        Update current branch 🔄
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onCleanupBranches}
        disabled={isLoading}
        className="flex items-center"
        size="lg"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Remove local branches that no longer exist remotely 🧹
      </Button>
    </div>
  );
};

export default ActionButtons;
