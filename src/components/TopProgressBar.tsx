
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TopProgressBarProps {
  isLoading: boolean;
  className?: string;
}

const TopProgressBar = ({ isLoading, className }: TopProgressBarProps) => {
  const [progress, setProgress] = React.useState(0);
  
  React.useEffect(() => {
    if (isLoading) {
      // Reset progress when loading starts
      setProgress(0);
      
      // Animate progress to 90% over 2 seconds
      const timer = setTimeout(() => {
        setProgress(90);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // When loading completes, quickly go to 100% then fade out
      setProgress(100);
    }
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-opacity duration-200",
        !isLoading && progress === 100 ? "opacity-0" : "opacity-100",
        className
      )}
    >
      <Progress 
        value={progress} 
        className="h-0.5 rounded-none bg-transparent" 
      />
    </div>
  );
};

export default TopProgressBar;

