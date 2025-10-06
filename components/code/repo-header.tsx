"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/api";

export function RepoHeader({ project, contributors }: { project?: Project; contributors?: Array<{ id: string; name: string | null; email: string; commits: string }> }) {
  if (!project) return null;
  const visibility = project.visibility === "public" ? "Public" : "Private";
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Image src="/sdark.png" alt="Owner" width={32} height={32} className="rounded-full" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant={project.visibility === "public" ? "default" : "secondary"}>{visibility}</Badge>
          </div>
          {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
          {contributors && contributors.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {contributors.slice(0, 5).map((c) => (
                <div key={c.id} className="text-xs text-muted-foreground">{c.name || c.email}</div>
              ))}
              {contributors.length > 5 && <div className="text-xs text-muted-foreground">+{contributors.length - 5}</div>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">{/* Clone / Open in CLI / New file (future) */}</div>
    </div>
  );
}