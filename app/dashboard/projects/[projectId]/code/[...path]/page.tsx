// app/dashboard/projects/[projectId]/code/[...path]/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react"; // Import useState, useEffect
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient, useMutation
import { useRouter } from "next/navigation"; // Import useRouter
import {
  getTree,
  getBlob,
  getProjectById,
  getBranches,
  deleteFile, // NEW: Import deleteFile
  type TreeEntry,
  type Branch,
  type Project,
  type BlobResponse,
} from "@/lib/api";
import { RepoHeader } from "@/components/code/repo-header";
import { BranchPicker } from "@/components/code/branch-picker";
import { TagList } from "@/components/code/tag-list";
import { PathBreadcrumbs } from "@/components/code/path-breadcrumbs";
import { FileTree } from "@/components/code/file-tree";
import { FileViewer } from "@/components/code/file-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // NEW: Import AlertDialog components
import { toast } from "sonner"; // NEW: Import toast

export default function CodeDeepPage({ params }: { params: { projectId: string; path: string[] } }) {
  const { projectId, path } = params;
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch") || "main";
  const currentPath = useMemo(() => (path || []).join("/"), [path]);

  // NEW: State for file deletion
  const [showDeleteFileDialog, setShowDeleteFileDialog] = useState(false);
  const [fileToDeletePath, setFileToDeletePath] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: project, isLoading: isLoadingProject } = useQuery<Project, Error>({ queryKey: ["project", projectId], queryFn: () => getProjectById(projectId) });
  const { data: branches } = useQuery<Branch[], Error>({ queryKey: ["branches", projectId], queryFn: () => getBranches(projectId) });
  const { data: tree, isLoading: treeLoading } = useQuery<TreeEntry[], Error>({
    queryKey: ["tree", projectId, branch, currentPath.replace(/\/[^/]+$/, "")],
    queryFn: () => getTree(projectId, { branch, path: currentPath.replace(/\/[^/]+$/, "") }),
  });
  const { data: blob, isLoading: blobLoading } = useQuery<BlobResponse, Error>({
    queryKey: ["blob", projectId, branch, currentPath],
    queryFn: () => getBlob(projectId, { branch, path: currentPath }),
  });

  // NEW: Mutation for file deletion
  const deleteFileMutation = useMutation({
    mutationFn: async () => {
      if (!fileToDeletePath || !project?.ownerId) {
        throw new Error("Invalid file to delete or owner ID missing.");
      }
      return deleteFile(projectId, { branch, path: fileToDeletePath, userId: project.ownerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree", projectId, branch, currentPath.replace(/\/[^/]+$/, "")] });
      queryClient.invalidateQueries({ queryKey: ["snapshots", projectId] });
      toast.success("File deleted", { description: "The file has been successfully removed." });
      // After deleting the file, navigate back to the parent directory or root
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      router.push(`/dashboard/projects/${projectId}/code/${parentPath}`);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete file", { description: error.message });
    },
    onSettled: () => {
      setShowDeleteFileDialog(false);
      setFileToDeletePath(null);
    },
  });

  const handleDeleteFile = (filePath: string) => {
    setFileToDeletePath(filePath);
    setShowDeleteFileDialog(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDeletePath || !project?.ownerId) {
      toast.error("Error", { description: "Invalid file to delete or owner ID missing." });
      return;
    }
    await deleteFileMutation.mutateAsync();
  };

  // Common project loading/redirect logic
  useEffect(() => {
    if (!isLoadingProject && !project) {
      router.replace("/dashboard/projects");
      toast.error("Project not found", { description: "The project you tried to access does not exist or has been deleted." });
    }
  }, [isLoadingProject, project, router]);

  if (isLoadingProject) {
    return (
      <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const isDeleting = deleteFileMutation.isPending;


  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
      <RepoHeader
        project={project}
        contributors={undefined}
        onDeleteProject={() => {/* not directly deleting project from here */}}
        onNewFile={() => {/* not creating files from here directly */}}
        onNewFolder={() => {/* not creating folders from here directly */}}
      />
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
            {treeLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <FileTree
                entries={tree || []}
                path={currentPath.replace(/\/[^/]+$/, "")}
                onOpen={(p) => router.push(`/dashboard/projects/${projectId}/code/${p}`)}
                // No delete handlers for file tree in deep page, as it only shows parent dir
              />
            )}
          </CardContent>
        </Card>

        <div>
          {blobLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <FileViewer blob={blob} onDeleteFile={handleDeleteFile} />
          )}
        </div>
      </div>

      {/* NEW: Delete File Confirmation Dialog for single file view */}
      <AlertDialog open={showDeleteFileDialog} onOpenChange={setShowDeleteFileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file &quot;
              <span className="font-mono">{fileToDeletePath}</span>&quot; from the current branch.
              This will create a new snapshot reflecting the deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete File"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}