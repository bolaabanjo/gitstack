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
import { getProjectById, Project } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Sidebar and context
import {
  Sidebar as UISidebar,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar, // Import useSidebar hook
} from "@/components/ui/sidebar";

// Custom components
import SidebarComponent from "@/components/sidebar";
import TopbarComponent from "@/components/topbar";

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
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

// --- Layout ---
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

  // --- Loading state ---
  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  // --- Error state ---
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-500">
        <h1 className="text-xl font-bold mb-4">Error or Project Not Found</h1>
        <p className="text-lg">
          {error ||
            "The requested project could not be loaded or does not exist."}
        </p>
        <p className="text-muted-foreground mt-4">
          You will be redirected shortly.
        </p>
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

  // --- Final Layout - Proper Sidebar Integration ---
  return (
    <ProjectContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen={true}> {/* defaultOpen true for desktop */}
        <div className="flex min-h-screen w-full">
          {/* Sidebar - Uses shadcn/ui Sidebar component */}
          {/* Responsive behavior: Always present in DOM, but visually hidden/collapsed on smaller screens */}
          <UISidebar collapsible="icon" variant="sidebar" className="max-md:hidden"> {/* Hide sidebar on mobile */}
            <SidebarComponent />
          </UISidebar>

          {/* Mobile Sidebar as a Sheet/Drawer */}
          {/* This is a visual sidebar for mobile, which will be toggled by the topbar */}
          <UISidebar collapsible="always" variant="mobile" className="md:hidden" placement="left">
            <SidebarComponent />
          </UISidebar>


          {/* Main content area */}
          <SidebarInset>
            <TopbarComponent
              // The Topbar needs access to toggle the mobile sidebar state
              toggleSidebar={useSidebar().toggleSidebar}
              isSidebarCollapsed={useSidebar().state === "collapsed"}
              // NEW: Pass the mobile specific sidebar state if needed, though useSidebar() handles it
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