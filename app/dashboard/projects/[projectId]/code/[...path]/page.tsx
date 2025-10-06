"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTree, getBlob, getProjectById, getBranches, type TreeEntry, type Branch, type Project } from "@/lib/api";
import { RepoHeader } from "@/components/code/repo-header";
import { BranchPicker } from "@/components/code/branch-picker";
import { TagList } from "@/components/code/tag-list";
import { PathBreadcrumbs } from "@/components/code/path-breadcrumbs";
import { FileTree } from "@/components/code/file-tree";
import { FileViewer } from "@/components/code/file-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CodeDeepPage({ params }: { params: { projectId: string; path: string[] } }) {
  const { projectId, path } = params;
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch") || "main";
  const currentPath = useMemo(() => (path || []).join("/"), [path]);

  const { data: project } = useQuery<Project, Error>({ queryKey: ["project", projectId], queryFn: () => getProjectById(projectId) });
  const { data: branches } = useQuery<Branch[], Error>({ queryKey: ["branches", projectId], queryFn: () => getBranches(projectId) });
  const { data: tree, isLoading: treeLoading } = useQuery<TreeEntry[], Error>({
    queryKey: ["tree", projectId, branch, currentPath.replace(/\/[^/]+$/, "")],
    queryFn: () => getTree(projectId, { branch, path: currentPath.replace(/\/[^/]+$/, "") }),
  });
  const { data: blob, isLoading: blobLoading } = useQuery({
    queryKey: ["blob", projectId, branch, currentPath],
    queryFn: () => getBlob(projectId, { branch, path: currentPath }),
  });

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
      <RepoHeader project={project} contributors={undefined} />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <BranchPicker branches={branches || []} value={branch} onChange={undefined} />
          <TagList tags={[]} />
        </div>
        <PathBreadcrumbs baseHref={`/dashboard/projects/${projectId}/code`} path={currentPath} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-full">
          <CardContent className="p-3">
            {treeLoading ? <Skeleton className="h-64 w-full" /> : <FileTree entries={tree || []} path={currentPath.replace(/\/[^/]+$/, "")} />}
          </CardContent>
        </Card>

        <div>
          {blobLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <FileViewer blob={blob} />
          )}
        </div>
      </div>
    </div>
  );
}