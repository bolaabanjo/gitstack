// app/dashboard/projects/[projectId]/code/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBranches,
  getTags,
  getTree,
  getReadmeApi,
  getProjectById,
  deleteProject,
  deleteFile, // NEW: Import deleteFile
  deleteFolder, // NEW: Import deleteFolder
  type Branch,
  type Tag,
  type TreeEntry,
  type Project,
  DeleteFilePayload,
} from "@/lib/api";
import { useState, useEffect } from "react";
import { RepoHeader } from "@/components/code/repo-header";
import { BranchPicker } from "@/components/code/branch-picker";
import { TagList } from "@/components/code/tag-list";
import { PathBreadcrumbs } from "@/components/code/path-breadcrumbs";
import { FileTree } from "@/components/code/file-tree";
import { Readme } from "@/components/code/readme";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { NewFileFolderDialog } from "@/components/code/new-file-folder-dialog";
import { useUser } from "@clerk/nextjs";

export default function CodeRootPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { user } = useUser();
  const pgUserId = user?.publicMetadata?.pgUserId;
  const [branch, setBranch] = useState<string>("main");
  const [path, setPath] = useState<string>("");
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false); // Renamed for clarity
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  // NEW: State for file/folder deletion
  const [showDeleteFileDialog, setShowDeleteFileDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ path: string; type: "file" | "folder" } | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: project, isLoading: isLoadingProject } = useQuery<Project, Error>({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
  });
  const { data: branches } = useQuery<Branch[], Error>({
    queryKey: ["branches", projectId],
    queryFn: () => getBranches(projectId),
  });
  const { data: tags } = useQuery<Tag[], Error>({
    queryKey: ["tags", projectId],
    queryFn: () => getTags(projectId),
  });
  const { data: tree, isLoading: treeLoading } = useQuery<TreeEntry[], Error>({
    queryKey: ["tree", projectId, branch, path],
    queryFn: () => getTree(projectId, { branch, path }),
  });
  const { data: readme } = useQuery({
    queryKey: ["readme", projectId, branch],
    queryFn: () => getReadmeApi(projectId, branch),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted", { description: "The project has been successfully removed." });
      router.push("/dashboard/projects");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete project", { description: error.message });
    },
    onSettled: () => {
      setShowDeleteProjectDialog(false);
    },
  });

  // NEW: Mutations for file/folder deletion
  const deleteFileMutation = useMutation({
    mutationFn: (payload: DeleteFilePayload) => deleteFile(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree", projectId, branch, path] });
      queryClient.invalidateQueries({ queryKey: ["snapshots", projectId] });
      toast.success("File deleted", { description: "The file has been successfully removed." });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete file", { description: error.message });
    },
    onSettled: () => {
      setShowDeleteFileDialog(false);
      setItemToDelete(null);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (payload: DeleteFilePayload) => deleteFolder(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree", projectId, branch, path] });
      queryClient.invalidateQueries({ queryKey: ["snapshots", projectId] });
      toast.success("Folder deleted", { description: "The folder and its contents have been successfully removed." });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete folder", { description: error.message });
    },
    onSettled: () => {
      setShowDeleteFileDialog(false);
      setItemToDelete(null);
    },
  });

  const handleDeleteProject = () => {
    setShowDeleteProjectDialog(true);
  };

  const confirmDeleteProject = () => {
    deleteProjectMutation.mutate(projectId);
  };

  const handleNewFile = () => {
    setShowNewFileDialog(true);
  };

  const handleNewFolder = () => {
    setShowNewFileDialog(true);
  };

  // NEW: Handlers for file/folder deletion (from FileTree)
  const handleDeleteFile = (filePath: string) => {
    setItemToDelete({ path: filePath, type: "file" });
    setShowDeleteFileDialog(true);
  };

  const handleDeleteFolder = (folderPath: string) => {
    setItemToDelete({ path: folderPath, type: "folder" });
    setShowDeleteFileDialog(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete || !project?.ownerId) {
      toast.error("Error", { description: "Invalid item to delete or owner ID missing." });
      return;
    }

    if (itemToDelete.type === "file") {
      await deleteFileMutation.mutateAsync({
        branch,
        path: itemToDelete.path,
        userId: project.ownerId, // Use project owner as userId for deletion
      });
    } else { // type === "folder"
      await deleteFolderMutation.mutateAsync({
        branch,
        path: itemToDelete.path,
        userId: project.ownerId, // Use project owner as userId for deletion
      });
    }
  };


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

  const isDeleting = deleteFileMutation.isPending || deleteFolderMutation.isPending;

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
      <RepoHeader
        project={project}
        contributors={undefined}
        onDeleteProject={handleDeleteProject}
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <BranchPicker branches={branches || []} value={branch} onChange={setBranch} />
          <TagList tags={tags || []} />
        </div>
        <PathBreadcrumbs baseHref={`/dashboard/projects/${projectId}/code`} path={path} onChangePath={setPath} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-full">
          <CardContent className="p-3">
            {treeLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <FileTree
                entries={tree || []}
                path={path}
                onOpen={(p) => router.push(`/dashboard/projects/${projectId}/code/${p}`)}
                onDeleteFile={handleDeleteFile}    // NEW: Pass delete file handler
                onDeleteFolder={handleDeleteFolder} // NEW: Pass delete folder handler
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Readme projectId={projectId} branch={branch} content={readme?.content ?? ""} />
          {!readme?.content && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No README yet. Click “Edit README” to create one for this branch.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project
              &quot;{project.name}&quot; and all its associated data (snapshots, branches, etc.).
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

      {/* New File/Folder Creation Dialog */}
      <NewFileFolderDialog
        isOpen={showNewFileDialog}
        onClose={() => setShowNewFileDialog(false)}
        projectId={projectId}
        branch={branch}
        currentPath={path}
        pgUserId={typeof pgUserId === "string" ? pgUserId : ""}
      />

      {/* NEW: Delete File/Folder Confirmation Dialog */}
      <AlertDialog open={showDeleteFileDialog} onOpenChange={setShowDeleteFileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <span className="font-semibold">{itemToDelete?.type}</span> &quot;
              <span className="font-mono">{itemToDelete?.path}</span>&quot; from the current branch.
              This will create a new snapshot reflecting the deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : `Delete ${itemToDelete?.type === "file" ? "File" : "Folder"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}