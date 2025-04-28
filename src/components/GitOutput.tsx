
import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GitOutputProps {
  output: string;
  className?: string;
}

const GitOutput: React.FC<GitOutputProps> = ({ output, className }) => {
  return (
    <div className={cn("w-full", className)}>
      <h2 className="text-lg font-semibold mb-2">Command Output</h2>
      <ScrollArea className="h-[250px] border rounded-md">
        <pre className="git-output text-sm p-4 whitespace-pre-wrap">
          {output || 'No output to display'}
        </pre>
      </ScrollArea>
    </div>
  );
};

export default GitOutput;
