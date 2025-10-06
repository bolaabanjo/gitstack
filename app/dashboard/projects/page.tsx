// app/dashboard/projects/page.tsx
"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ProjectListTopbar from "@/components/project-list-topbar";
import {
  createOrGetUser,
  getProjectsByOwner,
  deleteProject, // Import deleteProject
  type Project,
} from "@/lib/api";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import {
  Camera,
  Rocket,
  Lock,
  Globe,
  ArrowRight,
  Plus,
  Sparkles,
  MoreHorizontal, // Import MoreHorizontal for dropdown
  Trash2, // Import Trash2 for delete action
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, // Import Separator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import Alert Dialog components
import { toast } from "sonner"; // Import toast for notifications
import { useState } from "react"; // Import useState

// Enhanced skeleton loader with shimmer effect
function ProjectCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

// Enhanced project card with animations and delete option
function ProjectCard({ project, index, onDelete }: { project: Project; index: number; onDelete: (projectId: string, projectName: string) => void }) {
  const isPublic = project.visibility === "public";
  const lastUpdated = project.updated_at
    ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
    : "Recently";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link href={`/dashboard/projects/${project.id}/code`} className="block">
                <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                Updated {lastUpdated}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isPublic ? "default" : "secondary"}
                className="flex items-center gap-1 capitalize"
              >
                {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {project.visibility}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href={`/dashboard/projects/${project.id}/settings`}>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Project Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(project.id, project.name)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem]">
            {project.description || "No description provided."}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Camera className="h-3.5 w-3.5" />
              <span className="font-medium">{project.stats_snapshots ?? 0}</span>
              <span>snapshots</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Rocket className="h-3.5 w-3.5" />
              <span className="font-medium">{project.stats_deployments ?? 0}</span>
              <span>deploys</span>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex items-center justify-end">
            <Link href={`/dashboard/projects/${project.id}/code`}>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Get started by creating your first project. Projects help you organize your work and collaborate with your team.
      </p>
      <Link href="/dashboard/projects/new">
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Create your first project
        </Button>
      </Link>
    </motion.div>
  );
}

export default function ProjectsIndexPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(null);
  const [projectToDeleteName, setProjectToDeleteName] = useState<string | null>(null);

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

  // Mutation for deleting a project
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // Invalidate project list cache
      toast.success("Project deleted", { description: "The project has been successfully removed." });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete project", { description: error.message });
    },
    onSettled: () => {
      setShowDeleteDialog(false); // Close dialog regardless of outcome
      setProjectToDeleteId(null);
      setProjectToDeleteName(null);
    },
  });

  const handleDeleteClick = (projectId: string, projectName: string) => {
    setProjectToDeleteId(projectId);
    setProjectToDeleteName(projectName);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDeleteId) {
      deleteProjectMutation.mutate(projectToDeleteId);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col">
        <ProjectListTopbar />
        <div className="flex-1 p-4 md:p-8 lg:p-12">
          <div className="mx-auto max-w-7xl">
            <Skeleton className="mb-8 h-10 w-48" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <ProjectListTopbar />
        <div className="flex flex-1 items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-3 text-3xl font-bold">Welcome to Gitstack</h1>
            <p className="mb-8 text-muted-foreground max-w-md">
              Sign in to access your projects and start versioning everything.
            </p>
            <Link href="/login">
              <Button size="lg">Sign In</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ProjectListTopbar />
      <div className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
              <p className="text-muted-foreground mt-1">
                Manage and organize all your projects in one place
              </p>
            </div>
            <Link href="/dashboard/projects/new">
              <Button size="lg" className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </motion.div>

          {/* Content */}
          {isLoadingUser || isLoadingProjects ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : userError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-destructive/50 bg-destructive/10 p-6"
            >
              <p className="text-sm text-destructive">
                Failed to resolve user: {userError.message}
              </p>
            </motion.div>
          ) : projectsError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-destructive/50 bg-destructive/10 p-6"
            >
              <p className="text-sm text-destructive">
                Failed to load projects: {projectsError.message}
              </p>
            </motion.div>
          ) : !projects || projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onDelete={handleDeleteClick} // Pass the delete handler
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog for Project List */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project
              &quot;{projectToDeleteName}&quot; and all its associated data (snapshots, branches, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProjectMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}