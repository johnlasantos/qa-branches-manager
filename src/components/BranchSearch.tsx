
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
  // Change: Accept a more flexible onSelectRemoteBranch signature
  onSelectRemoteBranch: (branchName: string, opts?: { imported?: boolean }) => void;
  className?: string;
}

const BranchSearch: React.FC<BranchSearchProps> = ({
  remoteBranches,
  localBranches,
  onSearch,
  onSelectRemoteBranch,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const localBranchNames = new Set(localBranches.map(b => b.name));
  const remoteBranchNames = new Set(remoteBranches.map(b => b.name));

  // Only show suggestions for remote branches that do not have a local branch
  const filteredBranches = remoteBranches
    .filter(branch => {
      const notInLocal = !localBranchNames.has(branch.name);
      const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase());
      return notInLocal && matchesSearch;
    })
    .slice(0, 10);

  // When focusing the input, show suggestions (with top 10)
  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (!searchQuery) {
      // Show top 10 if not searching yet
      setShowSuggestions(true);
    }
  };

  // Typing in the input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
    setSelectedBranch(null); // Unset selection when changing query
    setShowSuggestions(true);
  };

  // Single-click selection
  const handleSelectBranch = (branchName: string) => {
    setSelectedBranch(branchName);
    setShowSuggestions(true);
    setSearchQuery(branchName);
    if (inputRef.current) {
      inputRef.current.value = branchName;
    }
  };

  // Import/Create local branch from selected branch
  const handleCheckout = () => {
    if (selectedBranch) {
      // Pass opts: imported = true
      onSelectRemoteBranch(selectedBranch, { imported: true });
      setSearchQuery('');
      setSelectedBranch(null);
      setShowSuggestions(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  // Hide suggestions if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset if cleared
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSelectedBranch(null);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Only enable import button if a branch from the suggestions is selected
  const importEnabled = selectedBranch !== null &&
    filteredBranches.some(branch => branch.name === selectedBranch);

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
            onFocus={handleInputFocus}
            className="pl-9"
            autoComplete="off"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={handleCheckout}
                  size="sm"
                  disabled={!importEnabled}
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
        <div className="search-results mt-1 z-10 absolute w-full bg-white border border-gray-200 rounded shadow-lg">
          <div className="py-1 text-xs text-gray-500 px-3 border-b">
            Remote branches
          </div>
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
                onMouseDown={e => e.preventDefault()} // Prevent input blur
                onClick={() => handleSelectBranch(branch.name)}
                tabIndex={0}
                aria-selected={selectedBranch === branch.name}
              >
                <div className="flex items-center">
                  <BranchIcon branchName={branch.name} hasRemote={true} className="mr-2" />
                  <span>{branch.name}</span>
                </div>
                {selectedBranch === branch.name && (
                  <span className="ml-2 text-xs text-blue-700 font-semibold">
                    Selected
                  </span>
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

