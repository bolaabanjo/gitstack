// app/dashboard/projects/[projectId]/code/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import {
  getBranches,
  getTags,
  getTree,
  getReadmeApi,
  getProjectById,
  deleteProject, // Import deleteProject
  type Branch,
  type Tag,
  type TreeEntry,
  type Project,
} from "@/lib/api";
import { useState, useMemo, useEffect } from "react"; // Import useEffect
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
} from "@/components/ui/alert-dialog"; // Import Alert Dialog components
import { toast } from "sonner"; // Import toast for notifications
import { useRouter } from "next/navigation"; // Import useRouter

export default function CodeRootPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [branch, setBranch] = useState<string>("main");
  const [path, setPath] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // State for delete dialog

  const queryClient = useQueryClient(); // Initialize query client
  const router = useRouter();

  const { data: project, isLoading: isLoadingProject } = useQuery<Project, Error>({ queryKey: ["project", projectId], queryFn: () => getProjectById(projectId) });
  const { data: branches } = useQuery<Branch[], Error>({ queryKey: ["branches", projectId], queryFn: () => getBranches(projectId) });
  const { data: tags } = useQuery<Tag[], Error>({ queryKey: ["tags", projectId], queryFn: () => getTags(projectId) });
  const { data: tree, isLoading: treeLoading } = useQuery<TreeEntry[], Error>({
    queryKey: ["tree", projectId, branch, path],
    queryFn: () => getTree(projectId, { branch, path }),
  });
  const { data: readme } = useQuery({ queryKey: ["readme", projectId, branch], queryFn: () => getReadmeApi(projectId, branch) });

  const contributorsQuery = undefined; // optional later

  // Mutation for deleting a project
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // Invalidate project list cache
      toast.success("Project deleted", { description: "The project has been successfully removed." });
      router.push("/dashboard/projects"); // Redirect to projects list
    },
    onError: (error: Error) => {
      toast.error("Failed to delete project", { description: error.message });
    },
    onSettled: () => {
      setShowDeleteDialog(false); // Close dialog regardless of outcome
    },
  });

  const handleDeleteProject = (id: string) => {
    setShowDeleteDialog(true);
    // The actual deletion will happen when confirming the dialog
  };

  const confirmDeleteProject = () => {
    deleteProjectMutation.mutate(projectId);
  };

  // If project data is loading, show skeleton.
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

  // If project is not found after loading, redirect.
  // This handles cases where the project was deleted or doesn't exist.
  useEffect(() => {
    if (!isLoadingProject && !project) {
      router.replace("/dashboard/projects");
      toast.error("Project not found", { description: "The project you tried to access does not exist or has been deleted." });
    }
  }, [isLoadingProject, project, router]);

  if (!project) {
    return null; // Don't render until project is loaded or redirected
  }

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
      <RepoHeader project={project} contributors={undefined} onDeleteProject={handleDeleteProject} />
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
            {treeLoading ? <Skeleton className="h-64 w-full" /> : <FileTree entries={tree || []} path={path} onOpen={(p) => setPath(p)} />}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
    </div>
  );
}