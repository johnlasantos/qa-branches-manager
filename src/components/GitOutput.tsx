
import React from 'react';
import { cn } from '@/lib/utils';

interface GitOutputProps {
  output: string;
  className?: string;
}

const GitOutput: React.FC<GitOutputProps> = ({ output, className }) => {
  return (
    <div className={cn("w-full", className)}>
      <h2 className="text-lg font-semibold mb-2">Command Output</h2>
      <pre className="git-output text-sm h-48 overflow-auto rounded border border-gray-300">
        {output || 'No output to display'}
      </pre>
    </div>
  );
};

export default GitOutput;
