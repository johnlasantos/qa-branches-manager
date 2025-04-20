
import React, { useState, useEffect, useRef } from 'react';
import { Search, GitBranch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BranchIcon from './BranchIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface RemoteBranch {
  name: string;
}

interface BranchSearchProps {
  remoteBranches: RemoteBranch[];
  onSearch: (query: string) => void;
  onSelectRemoteBranch: (branchName: string) => void;
  className?: string;
}

const BranchSearch: React.FC<BranchSearchProps> = ({ 
  remoteBranches, 
  onSearch, 
  onSelectRemoteBranch,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredBranches = remoteBranches
    .filter(branch => 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 10);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
    setSelectedBranch(null);
    
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectBranch = (branchName: string) => {
    setSelectedBranch(branchName);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.value = branchName;
    }
  };

  const handleCheckout = () => {
    if (selectedBranch) {
      onSelectRemoteBranch(selectedBranch);
      setSearchQuery('');
      setSelectedBranch(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("search-container", className)} ref={searchRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search remote branches..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        {selectedBranch && (
          <Button
            onClick={handleCheckout}
            size="sm"
            className="whitespace-nowrap bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            <GitBranch className="mr-2 h-4 w-4" />
            Create local branch
          </Button>
        )}
      </div>
      
      {showSuggestions && filteredBranches.length > 0 && (
        <div className="search-results mt-1">
          <div className="py-1 text-xs text-gray-500 px-3 border-b">Remote branches</div>
          <ul>
            {filteredBranches.map((branch) => (
              <li 
                key={branch.name}
                className="px-3 py-2 hover:bg-gray-100 flex items-center justify-between group cursor-pointer"
                onClick={() => handleSelectBranch(branch.name)}
              >
                <div className="flex items-center">
                  <BranchIcon branchName={branch.name} hasRemote={true} className="mr-2" />
                  <span>{branch.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BranchSearch;
