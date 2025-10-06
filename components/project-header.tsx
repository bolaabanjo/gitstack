    // components/project-header.tsx
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
      MoreVertical,
    } from "lucide-react";
    import Image from "next/image"; // Import Image from next/image

    interface ProjectHeaderProps {
      project?: Project; // Make project optional to handle loading states more gracefully
      contributors?: Array<{ id: string; name: string | null; email: string; commits: string }>;
    }

    export function ProjectHeader({ project, contributors }: ProjectHeaderProps) {
      if (!project) return null; // Render nothing if project data is not yet available
      
      const lastCommitMessage = "Initial commit"; // Placeholder for last commit message
      const lastCommitTimestamp = new Date(); // Placeholder for actual commit timestamp

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
                Last commit: &quot;{lastCommitMessage}&quot; &mdash;{" "}
                {formatDistanceToNow(lastCommitTimestamp, { addSuffix: true })}
              </div>
              <div className="flex items-center gap-2">
                {contributors && contributors.length > 0 ? (
                  contributors.map((contributor) => (
                    <Image
                      key={contributor.id}
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contributor.name || contributor.email)}&radius=50`} // Using a placeholder for avatar
                      alt={`Contributor ${contributor.name || contributor.email}`}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full"
                    />
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No contributors yet.</span>
                )}
                {contributors && contributors.length > 0 && (
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