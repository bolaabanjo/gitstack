// app/dashboard/projects/[projectId]/layout.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
// REMOVED: import { useQuery } from "convex/react";
// REMOVED: import { api } from "@/convex/_generated/api";
import { getProjectById, Project } from '@/lib/api'; // NEW: Import our API function and Project interface
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
// REMOVED: import { Doc, Id } from "@/convex/_generated/dataModel";

// --- Types ---
interface ProjectContextType {
  projectId: string | null; // Changed from Id<"projects"> to string
  project: Project | null; // Changed from Doc<"projects"> to Project
  isLoadingProject: boolean;
  error: string | null;
}

// --- Context ---
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used within a ProjectProvider");
  return context;
}

// --- Layout ---
export default function ProjectLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();

  // projectId from params will be a string, which matches our backend UUIDs
  const projectId = typeof params?.projectId === "string" ? params.projectId : null;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setError("No project ID provided.");
        setIsLoadingProject(false);
        router.replace("/dashboard/projects"); // Redirect if no ID
        return;
      }

      setIsLoadingProject(true);
      setError(null);
      try {
        const fetchedProject = await getProjectById(projectId); // UPDATED: Call our new API function
        setProject(fetchedProject);
      } catch (err: unknown) {
        console.error("Failed to fetch stack by ID:", err);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while loading stack details.";
        setError(errorMessage);
        toast.error("Error loading stack", {
          description: errorMessage,
          duration: 5000,
        });
        setProject(null);
        router.replace("/dashboard/projects"); // Redirect on error
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProjectData();
  }, [projectId, router]); // Depend on projectId and router

  // --- Loading state ---
  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading stack details...</p>
      </div>
    );
  }

  // --- Error state (only show if there's an error and not redirecting) ---
  if (error && !isLoadingProject) { // Only show if loading is done but there's an error
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center text-red-500">
        <h1 className="text-xl font-bold mb-4">Error Loading Stack</h1>
        <p className="text-lg">{error}</p>
        <p className="text-muted-foreground mt-4">Redirecting to stack list...</p>
      </div>
    );
  }

  // Ensure project is available before rendering children
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center text-red-500">
        <h1 className="text-xl font-bold mb-4">Stack Not Found</h1>
        <p className="text-lg">The requested stack could not be loaded.</p>
        <p className="text-muted-foreground mt-4">Redirecting to stack list...</p>
      </div>
    );
  }

  // --- Context value ---
  const contextValue: ProjectContextType = {
    projectId,
    project,
    isLoadingProject,
    error,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}