// components/project-header.tsx
"use client"; // Add this directive if not already present

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import {
  GitBranch,
  ArrowDownToLine,
  ExternalLink,
  MoreVertical,
  Trash2,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs"; // Import useUser

interface ProjectHeaderProps {
  project: Project;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectHeader({ project, onDeleteProject }: ProjectHeaderProps) {
  const { user } = useUser(); // Get current user from Clerk

  const lastCommitMessage = "Initial commit";
  const lastCommitTimestamp = new Date();

  const contributors = [
    { id: "1", avatar: "https://github.com/shadcn.png" },
    { id: "2", avatar: "https://github.com/vercel.png" },
  ];

  // Use the actual user's profile image if available from Clerk
  // Fallback to a static, known-good placeholder if Clerk user image is not available.
  // Using a local asset or a stable CDN image is better than dynamic 'random' URLs.
  const userAvatarUrl = user?.imageUrl || "/fav.png"; // Using your existing fav.png as a safe fallback

  return (
    <div className="flex items-start justify-between space-y-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {/* User Avatar - using Next.js Image component */}
          <Image
            src={userAvatarUrl}
            alt={user?.fullName || "User Avatar"} // Better alt text
            width={32}
            height={32}
            className="rounded-full self-center"
            priority
          />
          <h2 className="text-3xl font-bold tracking-tight">
            {project.name}
          </h2>
          <Badge
            variant={project.visibility === "public" ? "default" : "secondary"}
            className="capitalize"
          >
            {project.visibility === "public" ? "Public" : "Private"}
          </Badge>
        </div>
        <p className="text-muted-foreground">{project.description}</p>
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span>main</span>
          </div>
          <div>
            Last commit: &quot;{lastCommitMessage}&quot; &mdash;{" "}
            {formatDistanceToNow(lastCommitTimestamp, { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            {contributors.map((contributor) => (
              <Image
                key={contributor.id}
                src={contributor.avatar}
                alt={`Contributor ${contributor.id}`}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full"
                priority
              />
            ))}
            {contributors.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({contributors.length} contributors)
              </span>
            )}
          </div>
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