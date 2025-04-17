
import React from 'react';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GitHeaderProps {
  className?: string;
}

const GitHeader: React.FC<GitHeaderProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-4", className)}>
      <div className="flex items-center space-x-2">
        <GitBranch className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-800">scriptcase</h1>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        http://athena.scriptcase.net:8092/scriptcase-git/
      </p>
    </div>
  );
};

export default GitHeader;
