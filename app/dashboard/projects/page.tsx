// app/dashboard/projects/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
// REMOVED: import { useQuery } from "convex/react";
// REMOVED: import { api } from "@/convex/_generated/api";
import { getProjectsByOwner, Project } from '@/lib/api'; // NEW: Import our API function and Project interface
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { IconFolderCode } from "@tabler/icons-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Placeholder for a loading spinner or skeleton
function LoadingProjectsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="flex flex-col h-48 justify-between">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Main component to render the projects list or onboarding
function ProjectsContent() {
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const [projects, setProjects] = useState<Project[] | null>(null); // State to store fetched projects
  const [loadingProjects, setLoadingProjects] = useState(true); // Loading state for projects
  const [error, setError] = useState<string | null>(null); // Error state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isUserLoaded && isSignedIn && user?.id) {
      const fetchProjects = async () => {
        setLoadingProjects(true);
        setError(null);
        try {
          const fetchedProjects = await getProjectsByOwner(user.id);
          setProjects(fetchedProjects);
        } catch (err: unknown) {
          console.error("Failed to fetch stacks:", err);
          setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching stacks.");
          setProjects([]); // Set to empty array on error
        } finally {
          setLoadingProjects(false);
        }
      };

      fetchProjects();
    } else if (isUserLoaded && !isSignedIn) {
      setLoadingProjects(false);
      setProjects([]); // No projects if not signed in
    }
  }, [isUserLoaded, isSignedIn, user?.id]);

  // Handle initial loading and unauthenticated states
  if (!isUserLoaded || loadingProjects || !mounted) {
    return <LoadingProjectsSkeleton />;
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You must be signed in to view your stacks.</p>
        <Link href="/login" passHref>
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center text-red-500">
        <h1 className="text-3xl font-bold mb-4">Error Loading Stacks</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className='rounded-full cursor-pointer'>Retry</Button>
      </div>
    );
  }

  // --- Render based on whether projects exist ---
  if (!projects || projects.length === 0) {
    return (
      <Empty className="h-[calc(100vh-10rem)]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFolderCode />
          </EmptyMedia>
          <EmptyTitle>No stacks Yet</EmptyTitle> {/* Changed from No projects Yet to No stacks Yet */}
          <EmptyDescription>
            You haven&apos;t created any stacks yet. Get started by creating
            your first stack.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/dashboard/projects/new" passHref>
            <Button size="lg" className="flex items-center cursor-pointer space-x-2 rounded-full">
              <PlusCircle className="h-5 w-5" />
              <span>Create New Stack</span> {/* Changed from Create New Project to Create New Stack */}
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  // --- Render list of projects ---
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight">Your Stacks</h1> {/* Changed from Projects to Stacks */}
        <Link href="/dashboard/projects/new" passHref>
          <Button size="sm" className="flex items-center space-x-2">
            <PlusCircle className="h-4 w-4" />
            <span>New Stack</span> {/* Changed from New Project to New Stack */}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}/overview`} passHref>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{project.name}</CardTitle>
                <CardDescription>
                  {project.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  Visibility: <span className="capitalize font-medium">{project.visibility}</span>
                </p>
                <p>
                  Created: {format(project.created_at, 'PP')}
                </p>
                <p>
                  Last Updated: {formatDistanceToNow(project.updated_at, { addSuffix: true })}
                </p>
                {/* Updated to use snake_case for stats fields from backend */}
                {(project.stats_snapshots !== undefined || project.stats_deployments !== undefined) && (
                  <div className="pt-2 text-xs">
                    {project.stats_snapshots !== undefined && <p>{project.stats_snapshots} snapshots</p>}
                    {project.stats_deployments !== undefined && <p>{project.stats_deployments} deployments</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Wrap the content component in Suspense for data fetching.
export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingProjectsSkeleton />}>
      <ProjectsContent />
    </Suspense>
  );
}