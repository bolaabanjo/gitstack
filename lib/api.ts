// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Define interfaces for backend data
interface ProjectData {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  ownerId: string; // This will now be the PostgreSQL user UUID
}

export interface Project { // Exported for use in frontend components
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  ownerId: string;
  created_at: number; // UPDATED: Changed from createdAt to created_at
  updated_at: number; // UPDATED: Changed from updatedAt to updated_at
  stats_snapshots: number; // UPDATED: Changed from statsSnapshots to stats_snapshots
  stats_deployments: number; // UPDATED: Changed from statsDeployments to stats_deployments
  stats_last_deployed?: number; // UPDATED: Changed from statsLastDeployed to stats_last_deployed
}

interface UserData {
  clerkUserId: string;
  email: string;
  name?: string;
}

interface UserResponse {
  userId: string; // This is the PostgreSQL UUID
}

// NEW: Interfaces for CLI Authentication
export interface CliAuthRequestData {
  cliAuthToken: string;
  createdAt: number;
}

export interface CliAuthCompletionData {
  cliAuthToken: string;
  clerkUserId: string;
  pgUserId: string; // The PostgreSQL UUID for the user
  clerkSessionToken: string;
}

export interface CliAuthStatus {
  id?: string;
  cli_auth_token: string;
  status: 'pending' | 'completed' | 'failed' | 'not_found';
  clerk_user_id?: string;
  pg_user_id?: string; // Mapped from convex_user_id in DB
  clerk_session_token?: string;
  created_at?: number;
  completed_at?: number;
  message?: string; // For not_found status
}

export async function createOrGetUser(userData: UserData): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/users/create-or-get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create or get user');
  }

  return response.json();
}

export async function createProject(projectData: ProjectData): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create project');
  }

  return response.json();
}

export async function getProjectsByOwner(ownerId: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects?ownerId=${ownerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch projects');
  }

  return response.json();
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch project');
  }

  return response.json();
}

// NEW: CLI Authentication API functions
export async function createCliAuthRequest(requestData: CliAuthRequestData): Promise<CliAuthStatus> {
  const response = await fetch(`${API_BASE_URL}/cli-auth/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create CLI auth request');
  }

  return response.json();
}

export async function completeCliAuthRequest(completionData: CliAuthCompletionData): Promise<CliAuthStatus> {
  const response = await fetch(`${API_BASE_URL}/cli-auth/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(completionData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to complete CLI auth request');
  }

  return response.json();
}

export async function getCliAuthRequestStatus(cliAuthToken: string): Promise<CliAuthStatus> {
  const response = await fetch(`${API_BASE_URL}/cli-auth/status?cliAuthToken=${cliAuthToken}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get CLI auth request status');
  }

  return response.json();
}