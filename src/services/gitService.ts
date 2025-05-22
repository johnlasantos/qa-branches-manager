// This service connects to the Git backend API
import { Branch } from "@/components/BranchList";
import { RemoteBranch } from "@/components/BranchSearch";

// Define the Git operation response type
export interface GitOperationResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  message?: string;
  code?: number;
}

// Helper function for API requests
const apiRequest = async (endpoint: string, apiBaseUrl: string = '', options?: RequestInit) => {
  try {
    // Use the apiBaseUrl directly as provided, just ensure no double slashes
    const baseUrl = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '';
    const url = `${baseUrl}/${endpoint}`;
    
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
    if (import.meta.env.DEV) {
      console.error('API request failed:', error);
    }
    throw error;
  }
};

export interface Config {
  headerLink: string;
  basePath: string;
  apiBaseUrl: string;
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

export const getConfig = async (apiBaseUrl: string = ''): Promise<Config> => {
  const data = await apiRequest('config', apiBaseUrl);
  return data;
};

export const getLocalBranches = async (
  page: number = 0, 
  limit: number = 10,
  apiBaseUrl: string = ''
): Promise<PaginatedResponse<Branch>> => {
  return await apiRequest(`branches?page=${page}&limit=${limit}`, apiBaseUrl);
};

export const getRemoteBranches = async (
  page: number = 0, 
  limit: number = 10,
  apiBaseUrl: string = ''
): Promise<PaginatedResponse<RemoteBranch>> => {
  return await apiRequest(`remote-branches?page=${page}&limit=${limit}`, apiBaseUrl);
};

export const switchBranch = async (branchName: string, apiBaseUrl: string = ''): Promise<GitOperationResponse> => {
  const data = await apiRequest('checkout', apiBaseUrl, {
    method: 'POST',
    body: JSON.stringify({ branch: branchName }),
  });
  return data;
};

export const deleteBranch = async (branchName: string, apiBaseUrl: string = ''): Promise<GitOperationResponse> => {
  const data = await apiRequest('delete-branch', apiBaseUrl, {
    method: 'POST',
    body: JSON.stringify({ branch: branchName }),
  });
  return data;
};

export const updateCurrentBranch = async (apiBaseUrl: string = ''): Promise<GitOperationResponse> => {
  const data = await apiRequest('pull', apiBaseUrl, {
    method: 'POST'
  });
  return data;
};

export const cleanupBranches = async (apiBaseUrl: string = ''): Promise<GitOperationResponse> => {
  const data = await apiRequest('cleanup', apiBaseUrl, {
    method: 'POST'
  });
  
  // Handle possible warnings in the response but only in dev mode
  if (import.meta.env.DEV && data.warnings && data.warnings.length > 0) {
    console.warn('Cleanup warnings:', data.warnings);
  }
  
  return data;
};

export const searchBranches = async (
  query: string, 
  page: number = 0, 
  limit: number = 10,
  apiBaseUrl: string = ''
): Promise<PaginatedResponse<RemoteBranch>> => {
  return await apiRequest(
    `remote-branches/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    apiBaseUrl
  );
};
