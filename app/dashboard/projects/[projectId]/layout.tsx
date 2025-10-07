// app/dashboard/projects/[projectId]/layout.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

/* -------------------- Types & Context -------------------- */
interface ProjectContextType {
  projectId: string | null;
  project: Project | null;
  isLoadingProject: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject(): ProjectContextType {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx;
}

/* -------------------- Layout (parent) -------------------- */
/**
 * ProjectLayout - fetches project data and provides it via context.
 * NOTE: do NOT call useSidebar() here. Hooks that depend on SidebarProvider live in SidebarShell.
 */
export default function ProjectLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();

  const projectId = typeof params?.projectId === "string" ? params.projectId : null;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProjectData = async () => {
      if (!projectId) {
        if (mounted) {
          setError("No project ID provided.");
          setIsLoadingProject(false);
        }
        router.replace("/dashboard/projects");
        return;
      }

      if (mounted) {
        setIsLoadingProject(true);
        setError(null);
      }

      try {
        const fetchedProject = await getProjectById(projectId);
        if (mounted) setProject(fetchedProject);
      } catch (err: unknown) {
        console.error("Failed to fetch project by ID:", err);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while loading project details.";
        if (mounted) {
          setError(errorMessage);
          setProject(null);
        }
        toast.error("Error loading project", { description: errorMessage, duration: 5000 });
        router.replace("/dashboard/projects");
      } finally {
        if (mounted) setIsLoadingProject(false);
      }
    };

    fetchProjectData();
    return () => { mounted = false; };
  }, [projectId, router]);

  const contextValue: ProjectContextType = {
    projectId,
    project,
    isLoadingProject,
    error,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {/* SidebarProvider wraps the area that uses useSidebar */}
      <SidebarProvider defaultOpen={true}>
        <SidebarShell>{children}</SidebarShell>
      </SidebarProvider>
    </ProjectContext.Provider>
  );
}

/* -------------------- SidebarShell (child that uses useSidebar) -------------------- */
/**
 * SidebarShell is rendered inside SidebarProvider so useSidebar() is safe.
 * It handles rendering the two sidebar variants (desktop & mobile) and the Topbar.
 */
function SidebarShell({ children }: { children: ReactNode }) {
  const { project, isLoadingProject, error } = useProject();
  const { toggleSidebar, state: sidebarState } = useSidebar();

  // Loading state (renders inside the provider so hooks order is stable)
  if (isLoadingProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  // Error or missing project
  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-red-500">
        <div className="text-center px-4">
          <h1 className="text-xl font-bold mb-2">Error or Project Not Found</h1>
          <p className="mb-2">{error ?? "The requested project could not be loaded or does not exist."}</p>
          <p className="text-sm text-muted-foreground">You will be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar (visible on md+) */}
      <UISidebar collapsible="icon" variant="sidebar" className="hidden md:flex">
        <SidebarComponent />
      </UISidebar>

      {/* Mobile sidebar/drawer (visible on smaller screens) */}
      <UISidebar collapsible="offcanvas" variant="sidebar" className="md:hidden">
        <SidebarComponent />
      </UISidebar>

      {/* Main area + Topbar */}
      <SidebarInset className="flex-1 flex flex-col">
        <TopbarComponent
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={sidebarState === "collapsed"}
        />

        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
