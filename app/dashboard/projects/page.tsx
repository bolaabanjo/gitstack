// app/dashboard/projects/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component
import { useTheme } from 'next-themes'; // Import useTheme hook
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns'; // For date formatting

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
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const projects = useQuery(api.projects.getProjects);
  const { resolvedTheme } = useTheme(); // Get the current resolved theme
  const [mounted, setMounted] = useState(false); // State to handle hydration

  // Define correct paths for empty state illustrations based on your file names
  const emptyStateLightIllustration = '/imglight.png'; // Corrected path
  const emptyStateDarkIllustration = '/imgdark.png';   // Corrected path

  // Ensure component is mounted before using theme to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle loading and unauthenticated states
  if (!isUserLoaded || !isSignedIn || projects === undefined || !mounted) {
    return <LoadingProjectsSkeleton />; // Show skeleton while loading user, projects, or mounting
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You must be signed in to view your projects.</p>
        <Link href="/login" passHref>
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // --- Render based on whether projects exist ---
  if (!projects || projects.length === 0) {
    const illustrationSrc = resolvedTheme === 'dark'
      ? emptyStateDarkIllustration
      : emptyStateLightIllustration;

    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center space-y-6">
        {/* Empty State Illustration */}
        <Image
          src={illustrationSrc}
          alt="No projects yet"
          width={300} // Adjust width as needed
          height={200} // Adjust height as needed
          className="mb-4"
          priority // Prioritize loading for better UX
        />

        <h1 className="text-4xl font-extrabold tracking-tight">
          No projects yet. Let's create your first!
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Projects are the core of Gitstack, where you version everything from code to dependencies and datasets.
        </p>
        <Link href="/dashboard/projects/new" passHref>
          <Button size="lg" className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5" />
            <span>Create New Project</span>
          </Button>
        </Link>
      </div>
    );
  }

  // --- Render list of projects ---\
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight">Your Projects</h1>
        <Link href="/dashboard/projects/new" passHref>
          <Button size="sm" className="flex items-center space-x-2">
            <PlusCircle className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project._id} href={`/dashboard/projects/${project._id}/overview`} passHref>
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
                  Created: {format(project.createdAt, 'PP')}
                </p>
                <p>
                  Last Updated: {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                </p>
                {project.stats && (
                  <div className="pt-2 text-xs">
                    <p>{project.stats.snapshots} snapshots</p>
                    <p>{project.stats.deployments} deployments</p>
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