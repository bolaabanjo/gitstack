// components/code/repo-header.tsx
"use client";

import Image from "next/image";
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
  ExternalLink,
  MoreVertical,
  Trash2,
  Settings,
  PlusCircle, // NEW: Import PlusCircle for "New" button
  FileText,    // NEW: For new file icon
  Folder,      // NEW: For new folder icon
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface RepoHeaderProps {
  project?: Project;
  contributors?: Contributor[];
  onDeleteProject: (projectId: string) => void;
  onNewFile: () => void;    // NEW: Callback for new file
  onNewFolder: () => void;  // NEW: Callback for new folder
}

export function RepoHeader({ project, contributors, onDeleteProject, onNewFile, onNewFolder }: RepoHeaderProps) {
  const { user } = useUser();

  if (!project) return null;
  const visibility = project.visibility === "public" ? "Public" : "Private";

  const userAvatarUrl = user?.imageUrl || "/sdark.png";

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Image
          src={userAvatarUrl}
          alt={user?.fullName || "User Avatar"}
          width={32}
          height={32}
          className="rounded-full self-center"
          priority
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge
              variant={project.visibility === "public" ? "default" : "secondary"}
              className="capitalize"
            >
              {visibility}
            </Badge>
          </div>
          {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
          {contributors && contributors.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {contributors.slice(0, 5).map((c) => (
                <div key={c.id} className="text-xs text-muted-foreground">
                  {c.name || c.email} ({c.commits})
                </div>
              ))}
              {contributors.length > 5 && <div className="text-xs text-muted-foreground">+{contributors.length - 5} more</div>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* NEW: New File/Folder Dropdown */}
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