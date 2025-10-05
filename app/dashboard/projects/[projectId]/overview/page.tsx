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

// --- Placeholder Components for Dashboard Sections ---
// These remain as placeholders; we'll build them out later with real project data.

function OverviewComponentPlaceholder() {
  const { project } = useProject();
  return (
    <section className="mb-8 p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Project Overview: {project?.name}</h2>
      <p className="text-muted-foreground">This section will display key metrics and summaries for {project?.name}.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* UPDATED: Access stats directly from project object */}
        <div className="p-4 border rounded-md">Snapshots: {project?.stats_snapshots || 0}</div>
        <div className="p-4 border rounded-md">Deployments: {project?.stats_deployments || 0}</div>
        <div className="p-4 border rounded-md">
          Last Deployed: {project?.stats_last_deployed ? new Date(project.stats_last_deployed).toLocaleDateString() : 'N/A'}
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

function SnapshotTimelineComponentPlaceholder() {
  const { project } = useProject();
  return (
    <section className="p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Snapshot Timeline for {project?.name}</h2>
      <p className="text-muted-foreground">This section will visualize project snapshots over time.</p>
      <div className="mt-4 h-32 bg-muted rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">Timeline visualization will go here</p>
      </div>
    </section>
  );
}
// --- End Placeholder Components ---


function ProjectOverviewPageContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const { project, isLoadingProject, error } = useProject(); // Consume project context

  useEffect(() => {
    // This toast should generally be handled on the project list page or login flow.
    // Keeping it here for now, but its context might need refinement.
    if (searchParams.get('auth_success') === 'true') {
      toast("Welcome back to Gitstack!", {
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
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

      {/* Render the placeholder components for each section, now with project context */}
      <OverviewComponentPlaceholder />
      <ActivityFeedComponentPlaceholder />
      <SnapshotTimelineComponentPlaceholder />
    </div>
  );
}

// Wrap the content component in Suspense for data fetching.
export default function ProjectOverviewPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground ml-4">Loading project overview...</p>
        </div>
    }>
      <ProjectOverviewPageContent />
    </Suspense>
  );
}