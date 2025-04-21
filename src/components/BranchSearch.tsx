
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
  localBranches: { name: string }[];
  onSearch: (query: string) => void;
  onSelectRemoteBranch: (branchName: string) => void;
  className?: string;
}

const BranchSearch: React.FC<BranchSearchProps> = ({ 
  remoteBranches, 
  localBranches,
  onSearch, 
  onSelectRemoteBranch,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // New state
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const localBranchNames = new Set(localBranches.map(b => b.name));
  const remoteBranchNames = new Set(remoteBranches.map(b => b.name));

  // Only show suggestions for remote branches that DO NOT have a local branch AND DO NOT have a local with the same name remotely
  const filteredBranches = remoteBranches
    .filter(branch => {
      // Don't list if local branch exists and also exists remotely (so only list branches that aren't local at all)
      const isLocalAndRemote = localBranchNames.has(branch.name) && remoteBranchNames.has(branch.name);
      const notInLocal = !localBranchNames.has(branch.name);
      const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && notInLocal && !isLocalAndRemote;
    })
    .slice(0, 10);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
    setSelectedBranch(null);
    setHasSearched(true);
    setShowSuggestions(value.length > 0);
  };

  // Row click now always selects
  const handleSelectBranch = (branchName: string) => {
    setSelectedBranch(branchName);
    setShowSuggestions(true);
    if (inputRef.current) {
      inputRef.current.value = branchName;
    }
  };

  // Explicit checkout
  const handleCheckout = () => {
    if (selectedBranch) {
      onSelectRemoteBranch(selectedBranch);
      setSearchQuery('');
      setSelectedBranch(null);
      setHasSearched(false);
      setShowSuggestions(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  // Always allow deselect on empty input
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSelectedBranch(null);
      setShowSuggestions(false);
      setHasSearched(false);
    }
  }, [searchQuery]);

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={handleCheckout}
                  size="sm"
                  disabled={!selectedBranch || !hasSearched}
                  className="whitespace-nowrap bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 disabled:opacity-50"
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Create local branch
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a local branch from the selected remote branch</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {showSuggestions && filteredBranches.length > 0 && (
        <div className="search-results mt-1">
          <div className="py-1 text-xs text-gray-500 px-3 border-b">Remote branches</div>
          <ul>
            {filteredBranches.map((branch) => (
              <li 
                key={branch.name}
                className={cn(
                  "px-3 py-2 hover:bg-blue-50 flex items-center justify-between group cursor-pointer rounded",
                  selectedBranch === branch.name
                    ? "bg-blue-100 border border-blue-300"
                    : ""
                )}
                onClick={() => handleSelectBranch(branch.name)}
                tabIndex={0}
                aria-selected={selectedBranch === branch.name}
              >
                <div className="flex items-center">
                  <BranchIcon branchName={branch.name} hasRemote={true} className="mr-2" />
                  <span>{branch.name}</span>
                </div>
                {selectedBranch === branch.name && (
                  <span className="ml-2 text-xs text-blue-700 font-semibold">Selected</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BranchSearch;
