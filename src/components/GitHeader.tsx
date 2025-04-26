
import React, { useEffect, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConfig } from '@/services/gitService';

interface GitHeaderProps {
  className?: string;
}

const GitHeader: React.FC<GitHeaderProps> = ({ className }) => {
  const [headerLink, setHeaderLink] = useState<string>('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getConfig();
        setHeaderLink(config.headerLink);
      } catch (error) {
        console.error('Failed to fetch header link:', error);
      }
    };

    fetchConfig();
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center py-4", className)}>
      <div className="flex items-center space-x-2">
        <GitBranch className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-800">Branches Manager</h1>
      </div>
      <h3 className="text text-gray-500">scriptcase repository</h3>
      {headerLink && (
        <a 
          href={headerLink}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:text-blue-700 hover:underline mt-1"
        >
          {headerLink}
        </a>
      )}
    </div>
  );
};

export default GitHeader;
