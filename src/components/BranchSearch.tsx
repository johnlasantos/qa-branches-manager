
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import BranchIcon from './BranchIcon';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
  onSelectRemoteBranch: (branchName: string, opts?: { imported?: boolean }) => void;
  onScrollEnd?: () => void;
  className?: string;
}

const isSymbolicRef = (branchName: string) => {
  return branchName.includes('HEAD ->') || branchName.includes('origin/HEAD');
};

const BranchSearch: React.FC<BranchSearchProps> = ({
  remoteBranches,
  localBranches,
  onSearch,
  onSelectRemoteBranch,
  onScrollEnd,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLLIElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const localBranchNames = new Set(localBranches.map(b => b.name));
  
  const filteredBranches = remoteBranches
    .filter(branch => {
      const notInLocal = !localBranchNames.has(branch.name);
      const notSymbolicRef = !isSymbolicRef(branch.name);
      const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase());
      return notInLocal && notSymbolicRef && matchesSearch;
    });

  useEffect(() => {
    if (!onScrollEnd) return;

    observer.current = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting && showSuggestions) {
        setIsLoadingMore(true);
        onScrollEnd();
      }
    }, { threshold: 0.1 });

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.current.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef && observer.current) {
        observer.current.unobserve(currentLoadingRef);
      }
    };
  }, [onScrollEnd, showSuggestions]);
  
  useEffect(() => {
    if (isLoadingMore) {
      const timer = setTimeout(() => {
        setIsLoadingMore(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [remoteBranches.length]);

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleCaretClick = () => {
    setShowSuggestions(!showSuggestions);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
    setSelectedBranch(null);
    setShowSuggestions(true);
  };

  const handleBranchClick = (branchName: string) => {
    setSelectedBranch(branchName);
    // No longer setting the search input value
    // Opening the import dialog immediately when branch is clicked
    setShowImportDialog(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={searchRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search remote branches"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          className="pr-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input w-full"
          autoComplete="off"
        />
        <ChevronDown 
          className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 cursor-pointer" 
          onClick={handleCaretClick}
        />
      </div>
      
      <AlertDialog 
        open={showImportDialog} 
        onOpenChange={(isOpen) => {
          setShowImportDialog(isOpen);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Create and change a local branch from <span className="font-mono">{selectedBranch}</span>?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new local branch from the selected remote branch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowImportDialog(false);
                if (selectedBranch) {
                  onSelectRemoteBranch(selectedBranch, { imported: true });
                  // Clear the search query after importing but don't update input
                  setSearchQuery('');
                  setSelectedBranch(null);
                  setShowSuggestions(false);
                }
              }}
            >
              Import branch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {showSuggestions && filteredBranches.length > 0 && (
        <div 
          className="search-results mt-1 absolute left-0 bg-white border border-gray-200 rounded shadow-lg z-50 w-full" 
        >
          <div className="py-1 text-xs text-gray-500 px-3 border-b flex items-center">
            <span>Remote branches</span>
            {filteredBranches.length > 0 && (
              <span className="ml-1">({filteredBranches.length})</span>
            )}
            {isLoadingMore && (
              <Loader className="h-3 w-3 text-blue-500 animate-spin ml-2" />
            )}
          </div>
          <ScrollArea className="h-[calc(100vh-24rem)] max-h-56 overflow-auto">
            <ul className="space-y-2 p-2">
              {filteredBranches.map((branch) => (
                <TooltipProvider key={branch.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <li
                        className={cn(
                          "px-3 py-2 hover:bg-blue-50 flex items-center group cursor-pointer rounded",
                          selectedBranch === branch.name
                            ? "bg-blue-100 border border-blue-300"
                            : ""
                        )}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => handleBranchClick(branch.name)}
                        tabIndex={0}
                        aria-selected={selectedBranch === branch.name}
                      >
                        <div className="flex items-center">
                          <BranchIcon branchName={branch.name} hasRemote={true} className="mr-2" />
                          <span>{branch.name}</span>
                        </div>
                      </li>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Import this remote branch</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              <li ref={loadingRef} className="h-4">
                {/* Empty element for intersection observer */}
              </li>
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default BranchSearch;
