"use client";

import { useQuery } from "@tanstack/react-query";
import { getBranches, getTags, getTree, getReadmeApi, getProjectById, getContributorsApi, type Branch, type Tag, type TreeEntry, type Project, type Contributor } from "@/lib/api";
import { useState, useEffect } from "react";
import { RepoHeader } from "@/components/code/repo-header";
import { BranchPicker } from "@/components/code/branch-picker";
import { TagList } from "@/components/code/tag-list";
import { PathBreadcrumbs } from "@/components/code/path-breadcrumbs";
import { FileTree } from "@/components/code/file-tree";
import { Readme } from "@/components/code/readme";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeSearch } from "@/components/code/code-search"; // Import CodeSearch

export default function CodeRootPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [branch, setBranch] = useState<string>("main");
  const [path, setPath] = useState<string>("");

  const { data: project } = useQuery<Project, Error>({ queryKey: ["project", projectId], queryFn: () => getProjectById(projectId) });
  const { data: branches } = useQuery<Branch[], Error>({ queryKey: ["branches", projectId], queryFn: () => getBranches(projectId) });
  const { data: tags } = useQuery<Tag[], Error>({ queryKey: ["tags", projectId], queryFn: () => getTags(projectId) });
  const { data: tree, isLoading: treeLoading } = useQuery<TreeEntry[], Error>({
    queryKey: ["tree", projectId, branch, path],
    queryFn: () => getTree(projectId, { branch, path }),
  });
  const { data: readme } = useQuery({ queryKey: ["readme", projectId, branch], queryFn: () => getReadmeApi(projectId, branch) });
  const { data: contributors } = useQuery<Contributor[], Error>({ queryKey: ["contributors", projectId], queryFn: () => getContributorsApi(projectId) });

  // State for client-side filtering of the file tree
  const [filteredTreeEntries, setFilteredTreeEntries] = useState<TreeEntry[]>([]);

  // Initialize filteredTreeEntries when tree data changes
  useEffect(() => {
    if (tree) {
      setFilteredTreeEntries(tree);
    }
  }, [tree]);

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6">
      <RepoHeader project={project} contributors={contributors} /> {/* Pass contributors here */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BranchPicker branches={branches || []} value={branch} onChange={setBranch} />
            <TagList tags={tags || []} />
          </div>
          <PathBreadcrumbs baseHref={`/dashboard/projects/${projectId}/code`} path={path} onChangePath={setPath} />
        </div>
      </div>


      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-full">
          <CardContent className="p-3 space-y-3">
            <CodeSearch entries={tree || []} onResults={setFilteredTreeEntries} /> {/* Use filteredTreeEntries */}
            {treeLoading ? <Skeleton className="h-64 w-full" /> : <FileTree entries={filteredTreeEntries} path={path} onOpen={(p) => setPath(p)} />}
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
    </div>
  );
}