
// This service connects to the Git backend API
import { Branch } from "@/components/BranchList";
import { RemoteBranch } from "@/components/BranchSearch";

// Helper function for API requests with dynamic base URL
const apiRequest = async (endpoint: string, options?: RequestInit, apiBaseUrl?: string) => {
  // Use the provided apiBaseUrl or rely on the default (which should be set by the config context)
  const baseUrl = apiBaseUrl || '/api/';
  
  try {
    const url = `${baseUrl}${endpoint}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
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
  apiBaseUrl: string;
  basePath: string;
}

export interface PaginatedResponse<T> {
  branches: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export const getConfig = async (): Promise<Config> => {
  const data = await apiRequest('config');
  return data;
};

export const getLocalBranches = async (
  page: number = 0, 
  limit: number = 10, 
  apiBaseUrl?: string
): Promise<PaginatedResponse<Branch>> => {
  return await apiRequest(`branches?page=${page}&limit=${limit}`, undefined, apiBaseUrl);
};

export const getRemoteBranches = async (
  page: number = 0, 
  limit: number = 10, 
  apiBaseUrl?: string
): Promise<PaginatedResponse<RemoteBranch>> => {
  return await apiRequest(`remote-branches?page=${page}&limit=${limit}`, undefined, apiBaseUrl);
};

export const switchBranch = async (branchName: string, apiBaseUrl?: string): Promise<string> => {
  const data = await apiRequest('checkout', {
    method: 'POST',
    body: JSON.stringify({ branch: branchName }),
  }, apiBaseUrl);
  return data.message;
};

export const deleteBranch = async (branchName: string, apiBaseUrl?: string): Promise<string> => {
  const data = await apiRequest('delete-branch', {
    method: 'POST',
    body: JSON.stringify({ branch: branchName }),
  }, apiBaseUrl);
  return data.message;
};

export const updateCurrentBranch = async (apiBaseUrl?: string): Promise<string> => {
  const data = await apiRequest('pull', {
    method: 'POST'
  }, apiBaseUrl);
  return data.message;
};

export const cleanupBranches = async (apiBaseUrl?: string): Promise<string> => {
  const data = await apiRequest('cleanup', {
    method: 'POST'
  }, apiBaseUrl);
  
  // Handle possible warnings in the response
  if (data.warnings && data.warnings.length > 0) {
    console.warn('Cleanup warnings:', data.warnings);
  }
  
  return data.message;
};

export const searchBranches = async (
  query: string, 
  page: number = 0, 
  limit: number = 10, 
  apiBaseUrl?: string
): Promise<PaginatedResponse<RemoteBranch>> => {
  return await apiRequest(
    `remote-branches/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, 
    undefined, 
    apiBaseUrl
  );
};
