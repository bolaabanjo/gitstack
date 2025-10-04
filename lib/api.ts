// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface ProjectData {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  ownerId: string; // The Clerk user ID will be our ownerId in the backend
}

interface Project extends ProjectData {
  id: string;
  createdAt: number;
  updatedAt: number;
  statsSnapshots: number;
  statsDeployments: number;
  statsLastDeployed?: number;
}

export async function createProject(projectData: ProjectData): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Potentially add Authorization header here later if using tokens
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
      // Potentially add Authorization header here later if using tokens
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
      // Potentially add Authorization header here later if using tokens
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch project');
  }

  return response.json();
}