// app/dashboard/projects/[projectId]/overview/page.tsx
"use client";

import { useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Rocket, Clock, TrendingUp, Activity, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjectById, getSnapshots, Project, Snapshot } from '@/lib/api';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ProjectHeader } from "@/components/project-header";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Enhanced metrics card component
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  index 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  description?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced skeleton for metrics
function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Enhanced snapshot timeline component
function SnapshotTimelineComponent({ projectId }: { projectId: string }) {
  const { isLoading, error, data: snapshots } = useQuery<Snapshot[], Error>({
    queryKey: ['snapshots', projectId],
    queryFn: () => getSnapshots({ projectId: projectId }),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snapshots</CardTitle>
          <CardDescription>Your project&apos;s snapshot history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2 text-sm text-muted-foreground">Loading snapshots...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snapshots</CardTitle>
          <CardDescription>Your project&apos;s snapshot history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">
            Error loading snapshots: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snapshots</CardTitle>
          <CardDescription>Your project&apos;s snapshot history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Camera className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">No snapshots yet</p>
            <Button size="sm" variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Create your first snapshot
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Snapshots</CardTitle>
        <CardDescription>{snapshots.length} total snapshots</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {snapshots.slice(0, 5).map((snapshot, index) => (
            <motion.div
              key={snapshot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={`/dashboard/projects/${projectId}/snapshots/${snapshot.id}`}
                className="group block rounded-lg border p-3 transition-all hover:border-primary/50 hover:bg-accent/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {snapshot.title || `Snapshot ${snapshot.id.substring(0, 8)}`}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {snapshot.file_count} files
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNowStrict(new Date(snapshot.timestamp), { addSuffix: true })}
                      </span>
                    </div>
        </div>
                  {snapshot.external_id && (
                    <Badge variant="secondary" className="text-xs">
                      {snapshot.external_id.substring(0, 6)}
                    </Badge>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        {snapshots.length > 5 && (
          <Button variant="ghost" className="w-full mt-4" size="sm">
            View all snapshots
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Enhanced activity feed placeholder
function ActivityFeedComponent() {
  const activities = [
    { type: "snapshot", message: "New snapshot created", time: "2 hours ago" },
    { type: "deploy", message: "Deployed to production", time: "5 hours ago" },
    { type: "update", message: "Project settings updated", time: "1 day ago" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// File explorer placeholder
function FileExplorerPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>File Explorer</CardTitle>
        <CardDescription>Browse your project files and folders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">File explorer coming soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Browse and manage your project&apos;s file structure directly from the dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Main page component
export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  const { isSignedIn, isLoaded } = useUser();

  const searchParams = useSearchParams();
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery<Project, Error>({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (searchParams.get('auth_success') === 'true' && project) {
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

  if (!isLoaded) {
    return (
      <div className="flex-1 p-4 md:p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <MetricsSkeleton />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

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

  if (isLoadingProject) {
    return (
      <div className="flex-1 p-4 md:p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <MetricsSkeleton />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{projectError.message}</p>
          </CardContent>
        </Card>
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
    <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ProjectHeader project={project} />
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Snapshots"
          value={project.stats_snapshots || 0}
          icon={Camera}
          description="All time"
          index={0}
        />
        <MetricCard
          title="Deployments"
          value={project.stats_deployments || 0}
          icon={Rocket}
          description="Total deploys"
          index={1}
        />
        <MetricCard
          title="Last Deployed"
          value={project.stats_last_deployed ? formatDistanceToNowStrict(new Date(project.stats_last_deployed)) : 'Never'}
          icon={Clock}
          description={project.stats_last_deployed ? format(new Date(project.stats_last_deployed), 'PPp') : undefined}
          index={2}
        />
        <MetricCard
          title="Status"
          value="Active"
          icon={TrendingUp}
          description="All systems operational"
          index={3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column - File Explorer */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <FileExplorerPlaceholder />
        </motion.div>

        {/* Right Column - Snapshots & Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-6"
        >
          <SnapshotTimelineComponent projectId={projectId} />
          <ActivityFeedComponent />
        </motion.div>
      </div>
        </div>
  );
}