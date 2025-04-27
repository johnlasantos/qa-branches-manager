
import React, { useState, useEffect, useRef } from 'react';
import { Search, GitBranch, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import BranchIcon from './BranchIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const localBranchNames = new Set(localBranches.map(b => b.name));
  const remoteBranchNames = new Set(remoteBranches.map(b => b.name));

  const filteredBranches = remoteBranches
    .filter(branch => {
      const notInLocal = !localBranchNames.has(branch.name);
      const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase());
      return notInLocal && matchesSearch;
    });

  useEffect(() => {
    if (!onScrollEnd) return;

    observer.current = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting && showSuggestions) {
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

  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (!searchQuery) {
      setShowSuggestions(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
    setSelectedBranch(null); // Unset selection when changing query
    setShowSuggestions(true);
  };

  const handleSelectBranch = (branchName: string) => {
    setSelectedBranch(branchName);
    setShowSuggestions(true);
    setSearchQuery(branchName);
    if (inputRef.current) {
      inputRef.current.value = branchName;
    }
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

  useEffect(() => {
    if (searchQuery.length === 0) {
      setSelectedBranch(null);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const importEnabled = selectedBranch !== null &&
    filteredBranches.some(branch => branch.name === selectedBranch);

  return (
    <div className={cn("relative", className)} ref={searchRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Select remote branch"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            className="pr-9 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
            autoComplete="off"
          />
          <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={() => setShowImportDialog(true)}
                      size="sm"
                      disabled={!importEnabled}
                      className="whitespace-nowrap bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 disabled:opacity-50"
                    >
                      <GitBranch className="mr-2 h-4 w-4" />
                      Import local branch
                    </Button>
                  </AlertDialogTrigger>
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
                            setSearchQuery('');
                            setSelectedBranch(null);
                            setShowSuggestions(false);
                            if (inputRef.current) {
                              inputRef.current.value = '';
                            }
                          }
                        }}
                      >
                        Import branch
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create and change a local branch from the selected remote branch</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {showSuggestions && filteredBranches.length > 0 && (
        <div className="search-results mt-1 absolute left-0 bg-white border border-gray-200 rounded shadow-lg" style={{ width: inputRef.current ? inputRef.current.offsetWidth : 'auto' }}>
          <div className="py-1 text-xs text-gray-500 px-3 border-b">
            Remote branches
          </div>
          <ScrollArea className="max-h-56">
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
                  onMouseDown={e => e.preventDefault()}
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
              <li className="py-2 flex justify-center" ref={el => { loadingRef.current = el as HTMLLIElement; }}>
                <div className="h-4"></div>
              </li>
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default BranchSearch;
