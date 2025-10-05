// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Interface for data sent to create a project
interface CreateProjectData {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  ownerId: string; // The Clerk user ID will be our owner_id in the backend
}

// Interface for the project object received from the backend
export interface Project {
  id: string; // UUID from PostgreSQL
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  owner_id: string; // UUID from PostgreSQL (Clerk user ID)
  created_at: number; // Milliseconds since epoch
  updated_at: number; // Milliseconds since epoch
  stats_snapshots: number;
  stats_deployments: number;
  stats_last_deployed?: number; // Milliseconds since epoch
}

export async function createProject(projectData: CreateProjectData): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Potentially add Authorization header here later if using tokens
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    let errorText = 'Failed to create project';
    try {
      const errorData = await response.json();
      errorText = errorData.error || errorText;
    } catch (e) {
      console.error("Non-JSON error response (createProject):", await response.text());
      errorText = `Server error: ${response.statusText || response.status}`;
    }
    throw new Error(errorText);
  }

  return response.json();
}

export async function getProjectsByOwner(ownerId: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects?ownerId=${ownerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Potentially add Authorization header here later if using tokens
    },
  });

  if (!response.ok) {
    let errorText = 'Failed to fetch projects';
    try {
      const errorData = await response.json();
      errorText = errorData.error || errorText;
    } catch (e) {
      console.error("Non-JSON error response (getProjectsByOwner):", await response.text());
      errorText = `Server error: ${response.statusText || response.status}`;
    }
    throw new Error(errorText);
  }

  return response.json();
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Potentially add Authorization header here later if using tokens
    },
  });

  if (!response.ok) {
    let errorText = 'Failed to fetch project';
    try {
      const errorData = await response.json();
      errorText = errorData.error || errorText;
    } catch (e) {
      console.error("Non-JSON error response (getProjectById):", await response.text());
      errorText = `Server error: ${response.statusText || response.status}`;
    }
    throw new Error(errorText);
  }

  return response.json();
}