// app/dashboard/projects/[projectId]/layout.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // For utility classes
import { Id } from '@/convex/_generated/dataModel';

// --- Define ProjectContext ---
// This context will provide project details to all nested components.
interface ProjectContextType {
  projectId: string | null;
  project: any | null; // Use a more specific type once available from Convex
  isLoadingProject: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Custom hook to consume the project context
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

// --- Project Layout Component ---
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.projectId === 'string' ? params.projectId : null;

  // State to manage loading and error for project data
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Fetch project details using Convex query
  // We explicitly pass the projectId as a Convex Id type
  const project = useQuery(api.projects.getProjectById, projectId ? { projectId: projectId as Id<"projects"> } : 'skip');


  useEffect(() => {
    if (project === undefined) { // Still loading from Convex
      setIsLoadingProject(true);
      setProjectError(null);
    } else if (project === null && projectId) { // Project not found or user unauthorized
      setIsLoadingProject(false);
      setProjectError(`Project with ID "${projectId}" not found or you don't have access.`);
      toast.error("Project access denied", {
        description: `Could not load project: ${projectId}.`,
        duration: 5000,
      });
      router.replace('/dashboard/projects'); // Redirect to projects list
    } else if (project) { // Project successfully loaded
      setIsLoadingProject(false);
      setProjectError(null);
    }
  }, [project, projectId, router]);


  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center text-red-500">
        <h1 className="text-3xl font-bold mb-4">Error Loading Project</h1>
        <p className="text-lg">{projectError}</p>
        <p className="text-muted-foreground mt-4">Redirecting to project list...</p>
      </div>
    );
  }

  // If project is loaded and valid, provide it via context and render children
  const contextValue: ProjectContextType = {
    projectId,
    project,
    isLoadingProject: false,
    error: null,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}