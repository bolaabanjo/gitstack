// app/dashboard/projects/page.tsx
"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectListTopbar from "@/components/project-list-topbar";
import {
  createOrGetUser,
  getProjectsByOwner,
  type Project,
} from "@/lib/api";

export default function ProjectsIndexPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  const {
    data: pgUser,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["pgUser", user?.id],
    enabled: isLoaded && !!user?.id,
    queryFn: async () => {
      if (!user) throw new Error("User not available");
      const primaryEmail = user.emailAddresses?.[0]?.emailAddress ?? "";
      return await createOrGetUser({
        clerkUserId: user.id,
        email: primaryEmail,
        name: user.fullName ?? undefined,
      });
    },
  });

  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useQuery<Project[], Error>({
    queryKey: ["projects", pgUser?.userId],
    enabled: !!pgUser?.userId,
    queryFn: () => getProjectsByOwner(pgUser!.userId),
  });

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col">
        <ProjectListTopbar />
        <div className="flex-1 p-4 md:p-6">
          <Skeleton className="mb-6 h-10 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <ProjectListTopbar />
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div>
            <h1 className="mb-2 text-2xl font-semibold">Please sign in</h1>
            <p className="text-muted-foreground">You must be signed in to view your projects.</p>
            <div className="mt-6">
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ProjectListTopbar />
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your Projects</h1>
          <Link href="/dashboard/projects/new">
            <Button>New Project</Button>
          </Link>
        </div>

        {isLoadingUser || isLoadingProjects ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : userError ? (
          <div className="rounded-md border p-6 text-destructive">
            Failed to resolve user: {userError.message}
          </div>
        ) : projectsError ? (
          <div className="rounded-md border p-6 text-destructive">
            Failed to load projects: {projectsError.message}
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="mb-4 text-muted-foreground">You don&apos;t have any projects yet.</p>
            <Link href="/dashboard/projects/new">
              <Button>Create your first project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}/overview`}
                className="group rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-medium">{p.name}</h2>
                  <span className="text-xs capitalize text-muted-foreground">
                    {p.visibility}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {p.description || "No description provided."}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Snapshots: {p.stats_snapshots ?? 0}</span>
                  <span>Deployments: {p.stats_deployments ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}