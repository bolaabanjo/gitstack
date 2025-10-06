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

// --- Code page types ---
export interface Branch { id: string; name: string; head_snapshot_id: string | null }
export interface Tag { id: string; name: string; snapshot_id: string }
export type TreeEntry = { name: string; type: 'dir' | 'file'; size?: number }
export type BlobResponse = {
  path: string
  hash: string
  size?: number
  mode?: number
  content: string | null
  mime: string | null
  message?: string
}
export type ReadmeResponse = { content: string; updated_at: number | null; updated_by: string | null }
export type Contributor = { id: string; name: string | null; email: string; commits: string }

// --- Code page API ---
export async function getBranches(projectId: string): Promise<Branch[]> {
  const r = await fetch(`${API_BASE_URL}/projects/${projectId}/branches`, { cache: 'no-store' });
  if (!r.ok) throw new Error('Failed to fetch branches');
  return r.json();
}

export async function getTags(projectId: string): Promise<Tag[]> {
  const r = await fetch(`${API_BASE_URL}/projects/${projectId}/tags`, { cache: 'no-store' });
  if (!r.ok) throw new Error('Failed to fetch tags');
  return r.json();
}

export async function getTree(
  projectId: string,
  params: { branch?: string; path?: string } = {}
): Promise<TreeEntry[]> {
  const q = new URLSearchParams();
  if (params.branch) q.set('branch', params.branch);
  if (params.path) q.set('path', params.path);
  const r = await fetch(`${API_BASE_URL}/projects/${projectId}/tree?${q.toString()}`, { cache: 'no-store' });
  if (!r.ok) throw new Error('Failed to fetch tree');
  return r.json();
}

export async function getBlob(
  projectId: string,
  params: { branch?: string; path: string }
): Promise<BlobResponse> {
  const q = new URLSearchParams();
  if (params.branch) q.set('branch', params.branch);
  q.set('path', params.path);
  const r = await fetch(`${API_BASE_URL}/projects/${projectId}/blob?${q.toString()}`, { cache: 'no-store' });
  if (!r.ok) throw new Error('Failed to fetch blob');
  return r.json();
}

export async function getReadmeApi(projectId: string, branch = 'main'): Promise<ReadmeResponse> {
  const r = await fetch(`${API_BASE_URL}/projects/${projectId}/readme?branch=${encodeURIComponent(branch)}`, { cache: 'no-store' });
  if (!r.ok) throw new Error('Failed to fetch readme');
  return r.json();
}

export async function updateReadmeApi(
  projectId: string,
  body: { branch?: string; content: string; userId?: string }
): Promise<ReadmeResponse> {
  const r = await fetch(`${API_BASE_URL}/projects/${projectId}/readme`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('Failed to update readme');
  return r.json();
}

export async function getContributorsApi(projectId: string): Promise<Contributor[]> {
  const r = await fetch(`${API_BASE_URL}/projects/${projectId}/contributors`, { cache: 'no-store' });
  if (!r.ok) throw new Error('Failed to fetch contributors');
  return r.json();
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

// NEW: Interfaces for Snapshots and Snapshot Files
export interface FileData {
  path: string;
  hash: string;
  size?: number; // Optional
  mode?: number; // Optional
}

export interface SnapshotData {
  projectId: string;
  userId: string;
  title?: string;
  description?: string;
  timestamp: number;
  externalId?: string;
  files: FileData[];
}

export interface Snapshot {
  id: string;
  project_id: string;
  user_id: string;
  title?: string;
  description?: string;
  timestamp: number;
  file_count: number;
  external_id?: string;
  files?: SnapshotFile[]; // Optional, included when fetching by ID
}

export interface SnapshotFile {
  id: string;
  snapshot_id: string;
  path: string;
  hash: string;
  size?: number;
  mode?: number;
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

// NEW: Snapshot API functions
export async function createSnapshot(snapshotData: SnapshotData): Promise<Snapshot> {
  const response = await fetch(`${API_BASE_URL}/snapshots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snapshotData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create snapshot');
  }

  return response.json();
}

export async function getSnapshots(filters?: { projectId?: string; userId?: string }): Promise<Snapshot[]> {
  const queryParams = new URLSearchParams();
  if (filters?.projectId) {
    queryParams.append('projectId', filters.projectId);
  }
  if (filters?.userId) {
    queryParams.append('userId', filters.userId);
  }
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/snapshots${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch snapshots');
  }

  return response.json();
}

export async function getSnapshotById(snapshotId: string): Promise<Snapshot> {
  const response = await fetch(`${API_BASE_URL}/snapshots/${snapshotId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch snapshot');
  }

  return response.json();
}

export async function deleteSnapshot(snapshotId: string): Promise<{ message: string; id: string }> {
  const response = await fetch(`${API_BASE_URL}/snapshots/${snapshotId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete snapshot');
  }

  return response.json();
}