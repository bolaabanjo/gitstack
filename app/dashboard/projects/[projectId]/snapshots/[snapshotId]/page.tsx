"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSnapshotById, type Snapshot } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock, FileText, ArrowLeft } from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";

function SnapshotDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SnapshotDetailPage({
  params,
}: {
  params: { projectId: string; snapshotId: string };
}) {
  const { snapshotId, projectId } = params;

  const { data, isLoading, error } = useQuery<Snapshot, Error>({
    queryKey: ["snapshot", snapshotId],
    queryFn: () => getSnapshotById(snapshotId),
    enabled: !!snapshotId,
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 lg:p-12">
        <SnapshotDetailsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8 lg:p-12">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <div className="mt-4">
              <Link href={`/dashboard/projects/${projectId}/snapshots`}>
                <Button size="sm" variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Snapshots
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            {data.title || `Snapshot ${data.id.substring(0, 8)}`}
          </h1>
          <Badge variant="secondary">{data.file_count} files</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/projects/${projectId}/snapshots`}>
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Metadata for this snapshot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDistanceToNowStrict(new Date(data.timestamp), { addSuffix: true })} (
              {format(new Date(data.timestamp), "PPpp")})
            </span>
          </div>
          {data.description && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">{data.description}</span>
            </div>
          )}
          {data.external_id && (
            <div className="text-muted-foreground">
              External ID: <span className="font-mono">{data.external_id}</span>
            </div>
          )}
          <div className="text-muted-foreground">
            Snapshot ID: <span className="font-mono">{data.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>All files captured in this snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          {!data.files || data.files.length === 0 ? (
            <div className="text-sm text-muted-foreground">No files found for this snapshot.</div>
          ) : (
            <div className="space-y-2">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_200px_120px_100px] gap-4 px-2 text-xs font-medium text-muted-foreground">
                <div>Path</div>
                <div>Hash</div>
                <div>Size</div>
                <div>Mode</div>
              </div>
              {/* Rows */}
              <div className="space-y-1">
                {data.files.map((f) => (
                  <div
                    key={f.id}
                    className="grid grid-cols-[1fr_200px_120px_100px] gap-4 rounded-md border px-2 py-2 hover:bg-accent/50"
                  >
                    <div className="truncate font-mono">{f.path}</div>
                    <div className="font-mono text-xs truncate">{f.hash}</div>
                    <div className="text-sm text-muted-foreground">{typeof f.size === "number" ? `${f.size} B` : "-"}</div>
                    <div className="text-sm text-muted-foreground">{typeof f.mode === "number" ? f.mode : "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}