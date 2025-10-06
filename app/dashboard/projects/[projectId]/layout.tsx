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
import { getProjectById, Project } from '@/lib/api';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// NEW: Import Sidebar components and context from components/ui/sidebar
import {
  Sidebar as UISidebar, // Alias to avoid naming conflict with your custom Sidebar
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

// NEW: Import your custom Sidebar and Topbar components
import SidebarComponent from "@/components/sidebar"; // Your main functional sidebar
import TopbarComponent from "@/components/topbar";   // Your main functional topbar

// --- Types ---
interface ProjectContextType {
  projectId: string | null;
  project: Project | null;
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
        const fetchedProject = await getProjectById(projectId);
        setProject(fetchedProject);
      } catch (err: unknown) {
        console.error("Failed to fetch project by ID:", err);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while loading project details.";
        setError(errorMessage);
        toast.error("Error loading project", { // Updated toast message
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
  }, [projectId, router]);

  // --- Loading state for the entire layout ---
  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  // --- Error state (redirect on error is handled in useEffect) ---
  if (error || !project) {
    // If there's an error or no project, and we're not loading, show a fallback message
    // (redirect has already been triggered by useEffect)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-500">
        <h1 className="text-xl font-bold mb-4">Error or Project Not Found</h1>
        <p className="text-lg">{error || "The requested project could not be loaded or does not exist."}</p>
        <p className="text-muted-foreground mt-4">You will be redirected shortly.</p>
      </div>
    );
  }

  // --- Context value ---
  const contextValue: ProjectContextType = {
    projectId,
    project,
    isLoadingProject: false,
    error: null,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen={true}> {/* Manages sidebar state */}
        <div className="flex min-h-screen w-full"> {/* Main flex container for sidebar + content */}
          {/* Main Sidebar */}
          <UISidebar>
            <SidebarComponent isCollapsed={useSidebar().state === "collapsed"} />
          </UISidebar>

          {/* Main Content Area with Topbar and children */}
          <SidebarInset> {/* Automatically adjusts content based on sidebar */}
            <TopbarComponent
              toggleSidebar={useSidebar().toggleSidebar}
              isSidebarCollapsed={useSidebar().state === "collapsed"}
            />
            <main className="flex-1 overflow-auto bg-background text-foreground">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProjectContext.Provider>
  );
}