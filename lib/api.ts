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
  createdAt: number;
  updatedAt: number;
  statsSnapshots: number;
  statsDeployments: number;
  statsLastDeployed?: number;
}

interface UserData {
  clerkUserId: string;
  email: string;
  name?: string;
}

interface UserResponse {
  userId: string; // This is the PostgreSQL UUID
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