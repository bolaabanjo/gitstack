"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectById, Project } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Sidebar as UISidebar,
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

import SidebarComponent from "@/components/sidebar";
import TopbarComponent from "@/components/topbar";

interface ProjectContextType {
  projectId: string | null;
  project: Project | null;
  isLoadingProject: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

// Bridge component: safely uses useSidebar() under SidebarProvider
function TopbarBridge() {
  const sidebar = useSidebar();
  return (
    <TopbarComponent
      toggleSidebar={sidebar.toggleSidebar}
      isSidebarCollapsed={sidebar.state === "collapsed"}
    />
  );
}

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();

  const projectId =
    typeof params?.projectId === "string" ? params.projectId : null;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setError("No project ID provided.");
        setIsLoadingProject(false);
        router.replace("/dashboard/projects");
        return;
      }

      setIsLoadingProject(true);
      setError(null);

      try {
        const fetchedProject = await getProjectById(projectId);
        setProject(fetchedProject);
      } catch (err: unknown) {
        console.error("Failed to fetch project by ID:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading project details.";

        setError(errorMessage);
        toast.error("Error loading project", {
          description: errorMessage,
          duration: 5000,
        });

        setProject(null);
        router.replace("/dashboard/projects");
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProjectData();
  }, [projectId, router]);

  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-500">
        <h1 className="text-xl font-bold mb-4">Error or Project Not Found</h1>
        <p className="text-lg">
          {error || "The requested project could not be loaded or does not exist."}
        </p>
        <p className="text-muted-foreground mt-4">You will be redirected shortly.</p>
      </div>
    );
  }

  const contextValue: ProjectContextType = {
    projectId,
    project,
    isLoadingProject: false,
    error: null,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <UISidebar collapsible="icon" variant="sidebar">
            <SidebarComponent />
          </UISidebar>

          <SidebarInset>
            <TopbarBridge />
            <main className="flex-1 overflow-auto bg-background text-foreground">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProjectContext.Provider>
  );
}