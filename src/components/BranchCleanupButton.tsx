
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";

interface BranchCleanupButtonProps {
  onCleanup: () => void;
  isLoading: boolean;
}

const BranchCleanupButton: React.FC<BranchCleanupButtonProps> = ({ onCleanup, isLoading }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isLoading}
                className="flex items-center text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive/90"
              >
                <Trash2 size={16} className="mr-2" />
                <span>Delete deprecated branches</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all deprecated local branches?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>all local branches</strong> that no longer exist on the remote.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onCleanup}
                >
                  Delete deprecated branches
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TooltipTrigger>
        <TooltipContent>
          <p>This will permanently delete local branches that no longer exist remotely</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BranchCleanupButton;
