// This service connects to the Git backend API

import { Branch } from "@/components/BranchList";
import { RemoteBranch } from "@/components/BranchSearch";

// Get the API base URL from environment or default to localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper function for API requests
const apiRequest = async (endpoint: string, options?: RequestInit) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export interface Config {
  headerLink: string;
}

export const getConfig = async (): Promise<Config> => {
  const data = await apiRequest('/config');
  return data;
};

export const getLocalBranches = async (): Promise<Branch[]> => {
  const data = await apiRequest('/branches');
  return data.map((branch: any) => ({
    name: branch.name,
    isCurrent: branch.current,
    hasRemote: branch.hasRemote,
  }));
};

export const getRemoteBranches = async (): Promise<RemoteBranch[]> => {
  const data = await apiRequest('/remote-branches');
  return data.map((branch: any) => ({
    name: branch.name,
  }));
};

export const switchBranch = async (branchName: string): Promise<string> => {
  const data = await apiRequest('/checkout', {
    method: 'POST',
    body: JSON.stringify({ branch: branchName }),
  });
  return data.message;
};

export const deleteBranch = async (branchName: string): Promise<string> => {
  const data = await apiRequest('/delete-branch', {
    method: 'POST',
    body: JSON.stringify({ branch: branchName }),
  });
  return data.message;
};

export const updateCurrentBranch = async (): Promise<string> => {
  const data = await apiRequest('/pull', {
    method: 'POST'
  });
  return data.message;
};

export const cleanupBranches = async (): Promise<string> => {
  const data = await apiRequest('/cleanup', {
    method: 'POST'
  });
  
  // Handle possible warnings in the response
  if (data.warnings && data.warnings.length > 0) {
    console.warn('Cleanup warnings:', data.warnings);
  }
  
  return data.message;
};

export const searchBranches = async (query: string): Promise<RemoteBranch[]> => {
  const data = await apiRequest(`/remote-branches/search?q=${encodeURIComponent(query)}`);
  return data.map((branch: any) => ({
    name: branch.name,
  }));
};
