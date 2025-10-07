"use client";

import { Badge } from "@/components/ui/badge";
import { Project, Contributor } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownToLine,
  MoreVertical,
  Trash2,
  PlusCircle,
  FileText,
  Folder,
  Wrench,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface RepoHeaderProps {
  project?: Project;
  contributors?: Contributor[];
  onDeleteProject: (projectId: string) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
}

export function RepoHeader({
  project,
  contributors,
  onDeleteProject,
  onNewFile,
  onNewFolder,
}: RepoHeaderProps) {
  const { user } = useUser();

  if (!project) return null;
  const visibility = project.visibility === "public" ? "Public" : "Private";

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 flex-wrap">
      {/* LEFT SIDE */}
      <div className="flex items-start gap-3">
        <img
          src={user?.imageUrl || "/sdark.png"}
          alt={user?.fullName || "User Avatar"}
          className="w-8 h-8 rounded-full object-cover self-center"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
              {project.name}
            </h1>
            <Badge
              variant={project.visibility === "public" ? "default" : "secondary"}
              className="capitalize"
            >
              {visibility}
            </Badge>
          </div>

          {project.description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">
              {project.description}
            </p>
          )}

          {contributors && contributors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
              {contributors.slice(0, 5).map((c) => (
                <div key={c.id}>
                  {c.name || c.email} ({c.commits})
                </div>
              ))}
              {contributors.length > 5 && (
                <div>+{contributors.length - 5} more</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNewFile}>
              <FileText className="mr-2 h-4 w-4" /> New File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewFolder}>
              <Folder className="mr-2 h-4 w-4" /> New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm">
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Clone
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
              <Wrench className="mr-2 h-4 w-4" />
              Project Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteProject(project.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
