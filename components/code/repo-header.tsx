// components/code/repo-header.tsx
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/api";
import { Button } from "@/components/ui/button"; // Assuming Button is used for actions
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // Assuming Dropdown is used for actions
import { MoreVertical, Settings, Trash2, ArrowDownToLine, ExternalLink } from "lucide-react"; // Icons

interface RepoHeaderProps {
  project?: Project;
  contributors?: Array<{ id: string; name: string | null; email: string; commits: string }>[];
  onDeleteProject?: (projectId: string) => void;
  userAvatarUrl?: string; // New prop for user avatar URL
}

export function RepoHeader({ project, contributors, onDeleteProject, userAvatarUrl }: RepoHeaderProps) {
  if (!project) return null;

  const visibility = project.visibility === "public" ? "Public" : "Private";

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {/* User Avatar - using the new prop */}
        <Image
          src={userAvatarUrl || "/sdark.png"} // Fallback to default if not provided
          alt="User Avatar"
          width={32}
          height={32}
          className="rounded-full self-center" // Aligned to center
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant={project.visibility === "public" ? "default" : "secondary"}>{visibility}</Badge>
          </div>
          {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
          {contributors && contributors.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {contributors.slice(0, 5).map((c) => (
                // You might want to use an actual Avatar component here for consistency
                <Image
                  key={(c as any).id}
                  src={userAvatarUrl || "/sdark.png"} // Placeholder for contributor avatar
                  alt={`Contributor ${(c as any).name || (c as any).email}`}
                  width={24} // Smaller for contributors
                  height={24}
                  className="rounded-full"
                />
              ))}
              {contributors.length > 5 && (
                <span className="text-xs text-muted-foreground">+{contributors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Clone
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in CLI
        </Button>
        <Button variant="default" size="sm">
          Deploy
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Project Settings
            </DropdownMenuItem>
            {onDeleteProject && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDeleteProject(project.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}