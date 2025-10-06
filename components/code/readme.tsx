"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ReadmeEditor = dynamic(
  () => import("./readme-editor").then((m) => m.ReadmeEditor),
  { ssr: false }
);

type ReadmeProps = {
  projectId: string;
  branch: string;
  content: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
};

export function Readme({
  projectId,
  branch,
  content,
  updatedAt,
  updatedBy,
}: ReadmeProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="w-full flex items-center justify-between">
          <span>README</span>
          <div className="flex items-center gap-3">
            {updatedAt || updatedBy ? (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {updatedAt ? new Date(updatedAt).toLocaleString() : ""}
                {updatedBy ? ` • ${updatedBy}` : ""}
              </span>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              {content ? "Edit README" : "Create README"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {!content && (
        <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
          <div>No README yet. Create one!</div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setOpen(true)}>
              Create README
            </Button>
            <Button size="sm" variant="outline">
              Initialize with CLI
            </Button>
          </div>
          <div className="rounded-md bg-muted p-3 font-mono text-xs w-fit">
            $ gitstack snap -m &quot;init&quot;
          </div>
        </CardContent>
      )}

      {open && (
        <ReadmeEditor
          projectId={projectId}
          branch={branch}
          initial={content}
          onClose={() => setOpen(false)}
        />
      )}
    </Card>
  );
}
