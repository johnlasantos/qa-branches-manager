
// This is a mock service for frontend development
// In a real implementation, this would call your backend API

import { Branch } from "@/components/BranchList";
import { RemoteBranch } from "@/components/BranchSearch";

// Simulated delay to mimic API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockLocalBranches: Branch[] = [
  { name: "master", isCurrent: true, hasRemote: true },
  { name: "develop", isCurrent: false, hasRemote: true },
  { name: "feature/new-dashboard", isCurrent: false, hasRemote: true },
  { name: "bugfix/login-error", isCurrent: false, hasRemote: true },
  { name: "feature/old-feature", isCurrent: false, hasRemote: false },
  { name: "staging", isCurrent: false, hasRemote: true },
];

const mockRemoteBranches: RemoteBranch[] = [
  { name: "master" },
  { name: "develop" },
  { name: "feature/new-dashboard" },
  { name: "feature/user-profile" },
  { name: "feature/api-integration" },
  { name: "bugfix/login-error" },
  { name: "bugfix/menu-overlap" },
  { name: "staging" },
  { name: "release/v1.2.0" },
  { name: "hotfix/critical-security" },
  { name: "feature/notification-system" },
  { name: "feature/drag-drop-interface" },
];

export const getLocalBranches = async (): Promise<Branch[]> => {
  await delay(800); // Simulate network request
  return [...mockLocalBranches];
};

export const getRemoteBranches = async (): Promise<RemoteBranch[]> => {
  await delay(600); // Simulate network request
  return [...mockRemoteBranches];
};

export const switchBranch = async (branchName: string): Promise<string> => {
  await delay(1200); // Simulate network request
  return `Switched to branch '${branchName}'
Updating files: 100% (123/123), done.`;
};

export const deleteBranch = async (branchName: string): Promise<string> => {
  await delay(800); // Simulate network request
  return `Deleted branch ${branchName} (was 4a5b6c7).`;
};

export const updateCurrentBranch = async (): Promise<string> => {
  await delay(1500); // Simulate network request
  return `remote: Counting objects: 127, done.
remote: Compressing objects: 100% (84/84), done.
remote: Total 127 (delta 43), reused 0 (delta 0)
Receiving objects: 100% (127/127), 35.28 KiB | 8.82 MiB/s, done.
Resolving deltas: 100% (43/43), completed with 18 local objects.
From github.com:username/scriptcase
   f3a6b7c..9d4e5f1  master     -> origin/master
Updating f3a6b7c..9d4e5f1
Fast-forward
 src/components/Dashboard.js | 45 +++++++++++++++++++++++++++++++++++++++------
 src/styles/main.css         | 12 ++++++++++++
 2 files changed, 51 insertions(+), 6 deletions(-)`;
};

export const cleanupBranches = async (): Promise<string> => {
  await delay(1000); // Simulate network request
  return `Deleted branch feature/old-feature (was 1234567).
Deleted branch bugfix/obsolete-code (was 7654321).
Deleted branch temp-testing (was abcdefg).
3 stale branches removed.`;
};

export const searchBranches = async (query: string): Promise<RemoteBranch[]> => {
  await delay(300); // Simulate network request
  if (!query) return mockRemoteBranches.slice(0, 10);
  
  return mockRemoteBranches.filter(branch => 
    branch.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);
};
