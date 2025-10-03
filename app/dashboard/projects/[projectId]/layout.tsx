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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";

// --- Types ---
interface ProjectContextType {
  projectId: Id<"projects"> | null;
  project: Doc<"projects"> | null;
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

  const projectId =
    typeof params?.projectId === "string"
      ? (params.projectId as Id<"projects">)
      : null;

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const project = useQuery(
    api.projects.getProjectById,
    projectId ? { projectId } : "skip"
  );

  // --- Handle query states ---
  useEffect(() => {
    if (project === undefined) {
      // Query still loading
      setIsLoadingProject(true);
      setError(null);
    } else if (project === null && projectId) {
      // Project not found or access denied
      setIsLoadingProject(false);
      const message = `Project with ID "${projectId}" not found or access denied.`;
      setError(message);

      toast.error("Project access denied", {
        description: message,
        duration: 5000,
      });

      // Redirect back to project list
      router.replace("/dashboard/projects");
    } else {
      // Successfully loaded project
      setIsLoadingProject(false);
      setError(null);
    }
  }, [project, projectId, router]);

  // --- Loading state ---
  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center text-red-500">
        <h1 className="text-3xl font-bold mb-4">Error Loading Project</h1>
        <p className="text-lg">{error}</p>
        <p className="text-muted-foreground mt-4">Redirecting to project list...</p>
      </div>
    );
  }

  // --- Context value ---
  const contextValue: ProjectContextType = {
    projectId,
    project: project ?? null, // ensures type safety
    isLoadingProject,
    error,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}
