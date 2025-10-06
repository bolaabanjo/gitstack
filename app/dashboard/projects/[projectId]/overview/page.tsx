// app/dashboard/projects/[projectId]/overview/page.tsx
"use client";

import { useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjectById, getSnapshots, Project, Snapshot } from '@/lib/api';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ProjectHeader } from "@/components/project-header";
import { Skeleton } from "@/components/ui/skeleton";

// --- Placeholder Components for Dashboard Sections ---

// This component will be replaced by actual metrics later
function OverviewComponentPlaceholder({ project }: { project: Project }) {
  return (
    <section className="mb-8 p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Project Overview: {project.name}</h2>
      <p className="text-muted-foreground">This section will display key metrics and summaries for {project.name}.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 border rounded-md">Snapshots: {project.stats_snapshots || 0}</div>
        <div className="p-4 border rounded-md">Deployments: {project.stats_deployments || 0}</div>
        <div className="p-4 border rounded-md">
          Last Deployed: {project.stats_last_deployed ? format(new Date(project.stats_last_deployed), 'PPP') : 'N/A'}
        </div>
      </div>
    </section>
  );
}

// This component will be replaced by a live activity feed later
function ActivityFeedComponentPlaceholder({ project }: { project: Project }) {
  return (
    <section className="mb-8 p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Activity Feed for {project.name}</h2>
      <p className="text-muted-foreground">This section will show recent activities and events for this project.</p>
      <ul className="mt-4 space-y-2">
        <li className="p-2 border rounded-md">Activity 1 for {project.name}</li>
        <li className="p-2 border rounded-md">Activity 2 for {project.name}</li>
      </ul>
    </section>
  );
}

// Fetches and displays actual snapshots for the project
function SnapshotTimelineComponent({ projectId }: { projectId: string }) {
  const { isLoading, error, data: snapshots } = useQuery<Snapshot[], Error>({
    queryKey: ['snapshots', projectId],
    queryFn: () => getSnapshots({ projectId: projectId }),
    enabled: !!projectId, // Only run query if projectId is available
  });

  return (
    <section className="p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Snapshots</h2>
      <p className="text-muted-foreground mb-4">Here&apos;s a timeline of your project snapshots.</p>

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
                <Link href={`/dashboard/projects/${projectId}/snapshots/${snapshot.id}`}>View Details</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Main page component
export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  const { isSignedIn, isLoaded } = useUser(); // Used for authentication checks

  // Hooks must be called unconditionally at the top level
  const searchParams = useSearchParams(); // MOVED UP
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery<Project, Error>({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  // Effect to show welcome toast on successful auth and project load
  useEffect(() => { // MOVED UP
    if (searchParams.get('auth_success') === 'true' && project) { // Ensure project is loaded
      toast("Welcome back to Gitstack! 🎉", {
        description: `You are now viewing the dashboard for ${project.name}.`,
        duration: 8000,
      });

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('auth_success');
      const newUrl = `${window.location.pathname}${
        newSearchParams.toString() ? '?' + newSearchParams.toString() : ''
      }`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, project]);


  // Handle loading state for Clerk user data
  if (!isLoaded) {
    return (
      <div className="flex h-full flex-col space-y-8 p-8 md:flex">
        <Skeleton className="h-10 w-[250px]" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You must be signed in to view project details.</p>
        <Link href="/login" passHref>
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // Handle loading state for project data
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

  // Handle project fetching errors
  if (projectError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-destructive">Error loading project: {projectError.message}</p>
      </div>
    );
  }

  // Handle case where project is not found after loading
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

      {/* Quick Insights Bar Placeholder */}
      <OverviewComponentPlaceholder project={project} />

      <div className="grid flex-1 gap-12 md:grid-cols-[1fr_300px]">
        {/* Main content area for file explorer */}
        <div>
          {/* Placeholder for File Explorer */}
          <h3 className="text-lg font-medium mb-4">File Explorer (Coming Soon)</h3>
          <p className="text-muted-foreground">
            This section will display the project&apos;s file and folder structure.
          </p>
        </div>
        {/* Right sidebar for Snapshot Timeline and Activity Feed */}
        <div className="space-y-8">
          <SnapshotTimelineComponent projectId={projectId} />
          {/* Activity Feed Placeholder */}
          <ActivityFeedComponentPlaceholder project={project} />
        </div>
      </div>
        </div>
  );
}