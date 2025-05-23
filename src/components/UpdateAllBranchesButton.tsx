
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
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

interface UpdateAllBranchesButtonProps {
  onUpdateAllBranches: () => Promise<void>;
  isUpdating: boolean;
}

const UpdateAllBranchesButton: React.FC<UpdateAllBranchesButtonProps> = ({
  onUpdateAllBranches,
  isUpdating
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <AlertDialog 
          open={showConfirmDialog} 
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowConfirmDialog(true)}
                className="ml-2"
                disabled={isUpdating}
              >
                <RefreshCw 
                  className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} 
                />
                <span className="hidden sm:inline ml-1">Update local branches</span>
              </Button>
            </TooltipTrigger>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Update all local branches?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will update all local branches that have matching remote tracking branches.
                This operation may take some time depending on the number of branches and repository size.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowConfirmDialog(false);
                  onUpdateAllBranches();
                }}
              >
                Update All Branches
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <TooltipContent>
          <p>Update all local branches from remote</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UpdateAllBranchesButton;
