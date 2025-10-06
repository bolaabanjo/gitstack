// app/dashboard/projects/[projectId]/overview/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading states
import { useProject } from '@/app/dashboard/projects/[projectId]/layout'; // Import useProject hook
import { useQuery } from '@tanstack/react-query'; // NEW: Import useQuery
import { getSnapshots, Project, Snapshot } from '@/lib/api'; // NEW: Import getSnapshots and Snapshot interface
import { format, formatDistanceToNowStrict } from 'date-fns'; // For date formatting
import { ProjectHeader } from "@/components/project-header";
import { Skeleton } from "@/components/ui/skeleton";
// import { Project } from '@/lib/types'; // FIX: Removed incorrect import

// --- Placeholder Components for Dashboard Sections (mostly remain) ---

function OverviewComponentPlaceholder() {
  const { project } = useProject();
  return (
    <section className="mb-8 p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Project Overview: {project?.name}</h2>
      <p className="text-muted-foreground">This section will display key metrics and summaries for {project?.name}.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 border rounded-md">Snapshots: {project?.stats_snapshots || 0}</div>
        <div className="p-4 border rounded-md">Deployments: {project?.stats_deployments || 0}</div>
        <div className="p-4 border rounded-md">
          Last Deployed: {project?.stats_last_deployed ? format(new Date(project.stats_last_deployed), 'PPP') : 'N/A'}
        </div>
      </div>
    </section>
  );
}

function ActivityFeedComponentPlaceholder() {
  const { project } = useProject();
  return (
    <section className="mb-8 p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Activity Feed for {project?.name}</h2>
      <p className="text-muted-foreground">This section will show recent activities and events for this project.</p>
      <ul className="mt-4 space-y-2">
        <li className="p-2 border rounded-md">Activity 1 for {project?.name}</li>
        <li className="p-2 border rounded-md">Activity 2 for {project?.name}</li>
      </ul>
    </section>
  );
}

// UPDATED: Now fetches and displays actual snapshots
function SnapshotTimelineComponent() {
  const { project } = useProject();
  const { isLoading, error, data: snapshots } = useQuery<Snapshot[], Error>({
    queryKey: ['snapshots', project?.id],
    queryFn: () => getSnapshots({ projectId: project?.id }),
    enabled: !!project?.id, // Only run query if projectId is available
  });

  if (!project) {
    return null; // Should ideally be handled by parent or layout
  }

  return (
    <section className="p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Snapshots for {project.name}</h2>
      <p className="text-muted-foreground mb-4">Here's a timeline of your project snapshots.</p>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading snapshots...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500">
          <p>Error loading snapshots: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && (!snapshots || snapshots.length === 0) && (
        <div className="h-32 flex items-center justify-center bg-muted rounded-md">
          <p className="text-muted-foreground">No snapshots found for this project.</p>
        </div>
      )}

      {!isLoading && !error && snapshots && snapshots.length > 0 && (
        <div className="space-y-4">
          {snapshots.map((snapshot) => (
            <div key={snapshot.id} className="p-4 border rounded-md flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{snapshot.title || `Snapshot ${snapshot.id.substring(0, 8)}`}</h3>
                <p className="text-sm text-muted-foreground">
                  {snapshot.file_count} files • Created {formatDistanceToNowStrict(new Date(snapshot.timestamp), { addSuffix: true })}
                </p>
                {snapshot.external_id && <p className="text-xs text-muted-foreground">ID: {snapshot.external_id}</p>}
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/projects/${project.id}/snapshots/${snapshot.id}`}>View Details</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// --- End Updated Components ---


function ProjectOverviewPageContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const { project, isLoadingProject, error } = useProject(); // Consume project context

  useEffect(() => {
    if (searchParams.get('auth_success') === 'true') {
      toast("Welcome back to Gitstack! 🎉", { // Added emoji for welcome
        description: `You are now viewing the dashboard for ${project?.name || 'your project'}.`,
        duration: 8000,
      });

      // Clean up the URL param
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('auth_success');
      const newUrl = `${window.location.pathname}${
        newSearchParams.toString() ? '?' + newSearchParams.toString() : ''
      }`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, project]);


  // Handle loading states for Clerk user data
  if (!isLoaded || isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground ml-4">Loading project dashboard...</p>
      </div>
    );
  }

  // Handle unauthenticated state (should ideally be caught by layout/middleware)
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">\
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You must be signed in to view project details.</p>
        <Link href="/login" passHref>
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // Handle project loading errors (should be caught by ProjectLayout)
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center text-red-500">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-lg">{error || "Project not found or accessible."}</p>
        <Link href="/dashboard/projects" passHref>
          <Button className="mt-4">Back to Projects</Button>
        </Link>
      </div>
    );
  }


  // --- Render Project-Specific Dashboard Content ---
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Project <span className="text-primary">{project.name}</span> Overview
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl">
        Hello, {user?.fullName || user?.emailAddresses[0]?.emailAddress || "Gitstack User"}!
        Here&apos;s a quick summary of your project&apos;s health and recent activity for *{project.name}*.
      </p>

      {/* Render the updated snapshot component and other placeholders */}
      <OverviewComponentPlaceholder />
      <ActivityFeedComponentPlaceholder />
      <SnapshotTimelineComponent /> {/* UPDATED: Using the new SnapshotTimelineComponent */}
    </div>
  );
}

// Wrap the content component in Suspense for data fetching.
export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery<Project, Error>({ queryKey: ["project", projectId] });

  const {
    data: snapshots,
    isLoading: isLoadingSnapshots,
    error: snapshotsError,
  } = useQuery<Snapshot[], Error>({ queryKey: ["snapshots", projectId] });

  if (isLoadingProject) {
    return (
      <div className="flex h-full flex-col space-y-8 p-8 md:flex">
        <Skeleton className="h-10 w-[250px]" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-destructive">Error: {projectError.message}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <ProjectHeader project={project} />

      <div className="grid flex-1 gap-12 md:grid-cols-[1fr_200px]">
        {/* Main content area for file explorer */}
        <div>
          {/* Placeholder for File Explorer */}
          <h3 className="text-lg font-medium">File Explorer (Coming Soon)</h3>
          <p className="text-muted-foreground">
            This section will display the project's file and folder structure.
          </p>
        </div>
        {/* Right sidebar for Snapshot Timeline */}
        <div>
          <SnapshotTimelineComponent
          // FIX: Removed props, as SnapshotTimelineComponent fetches its own data
          />
        </div>
      </div>
    </div>
  );
}