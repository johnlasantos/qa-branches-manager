
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import BranchIcon from './BranchIcon';

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
    
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectBranch = (branchName: string) => {
    onSelectRemoteBranch(branchName);
    setSearchQuery('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Close suggestions when clicking outside
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
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search branches..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>
      
      {showSuggestions && filteredBranches.length > 0 && (
        <div className="search-results mt-1">
          <div className="py-1 text-xs text-gray-500 px-3 border-b">Remote branches</div>
          <ul>
            {filteredBranches.map((branch) => (
              <li 
                key={branch.name}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                onClick={() => handleSelectBranch(branch.name)}
              >
                <BranchIcon branchName={branch.name} hasRemote={true} className="mr-2" />
                <span>{branch.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BranchSearch;
