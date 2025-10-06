"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSnapshots, type Snapshot } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock, FileText, ArrowRight } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { motion } from "framer-motion";

function SnapshotListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function SnapshotItem({ snapshot, projectId, index }: { snapshot: Snapshot; projectId: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/dashboard/projects/${projectId}/snapshots/${snapshot.id}`}>
        <div className="flex items-center justify-between rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/50">
          <div className="flex items-center gap-3 min-w-0">
            <Camera className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">
                {snapshot.title || `Snapshot ${snapshot.id.substring(0, 8)}`}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-3">
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
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function ProjectSnapshotsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;

  const { data, isLoading, error } = useQuery<Snapshot[], Error>({
    queryKey: ["snapshots", projectId],
    queryFn: () => getSnapshots({ projectId }),
    enabled: !!projectId,
  });

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Snapshots</h1>
          <p className="text-muted-foreground mt-1">Your project’s snapshot history</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{data?.length ?? 0} total</Badge>
          <Button size="sm" variant="outline" disabled>
            New snapshot
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Snapshots</CardTitle>
          <CardDescription>Explore and drill into snapshot details</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SnapshotListSkeleton />
          ) : error ? (
            <div className="text-sm text-destructive">Failed to load snapshots: {error.message}</div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Camera className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-2">No snapshots yet</p>
              <p className="text-xs text-muted-foreground">Create your first snapshot from the CLI</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((snapshot, i) => (
                <SnapshotItem key={snapshot.id} snapshot={snapshot} projectId={projectId} index={i} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}