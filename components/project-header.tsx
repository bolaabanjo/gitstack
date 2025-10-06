import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import {
  GitBranch,
  ArrowDownToLine,
  ExternalLink,
  // Github, // FIX: Removed unused import
  MoreVertical,
} from "lucide-react";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  // Placeholder for last commit message and timestamp
  const lastCommitMessage = "Initial commit";
  const lastCommitTimestamp = new Date(); // Replace with actual commit timestamp

  // Placeholder for contributors
  const contributors = [
    { id: "1", avatar: "https://github.com/shadcn.png" },
    { id: "2", avatar: "https://github.com/vercel.png" },
  ];

  return (
    <div className="flex items-center justify-between space-y-2">
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
            Last commit: &quot;{lastCommitMessage}&quot; &mdash;{" "} {/* FIX: Escaped double quotes */}
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
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Delete Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}