// components/project-header.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, // Import Separator
} from "@/components/ui/dropdown-menu";
import { Project } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import {
  GitBranch,
  ArrowDownToLine,
  ExternalLink,
  MoreVertical,
  Trash2, // Import Trash2 icon
  Settings, // Import Settings icon
} from "lucide-react";
import Image from "next/image"; // Import Image component

interface ProjectHeaderProps {
  project: Project;
  onDeleteProject: (projectId: string) => void; // New prop for delete action
}

export function ProjectHeader({ project, onDeleteProject }: ProjectHeaderProps) {
  // Placeholder for last commit message and timestamp
  const lastCommitMessage = "Initial commit";
  const lastCommitTimestamp = new Date(); // Replace with actual commit timestamp

  // Placeholder for contributors
  const contributors = [
    { id: "1", avatar: "https://github.com/shadcn.png" },
    { id: "2", avatar: "https://github.com/vercel.png" },
  ];

  // Placeholder for user avatar (replace with actual user avatar logic if available)
  const userAvatarUrl = "https://source.unsplash.com/random/32x32?person"; // Example placeholder avatar

  return (
    <div className="flex items-start justify-between space-y-2">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <Image
          src={userAvatarUrl}
          alt="User Avatar"
          width={32}
          height={32}
          className="rounded-full self-center" // Aligned to center
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
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
              <span>main</span> {/* Placeholder for branch name */}
            </div>
            <div>
              Last commit: &quot;{lastCommitMessage}&quot; &mdash;{" "}
              {formatDistanceToNow(lastCommitTimestamp, { addSuffix: true })}
            </div>
            <div className="flex items-center gap-2">
              {contributors.map((contributor) => (
                // Replace with actual Avatar component if available and desired
                <img
                  key={contributor.id}
                  src={contributor.avatar}
                  alt={`Contributor ${contributor.id}`}
                  className="h-6 w-6 rounded-full"
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
              onClick={() => onDeleteProject(project.id)} // Pass project ID to parent handler
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