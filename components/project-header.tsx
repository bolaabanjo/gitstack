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
  Globe,
  Lock,
  Copy,
  Settings,
  Trash2,
  Rocket,
  Terminal,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  // Placeholder data - replace with real data later
  const lastCommitMessage = "feat: add file explorer component";
  const lastCommitTimestamp = new Date(Date.now() - 3600000 * 2);
  const currentBranch = "main";
  const commitHash = "9e1675d";

  const contributors = [
    { id: "1", name: "BA", avatar: "https://github.com/shadcn.png" },
    { id: "2", name: "VL", avatar: "https://github.com/vercel.png" },
  ];

  const isPublic = project.visibility === "public";
  const VisibilityIcon = isPublic ? Globe : Lock;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Project Name & Visibility */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge
              variant={isPublic ? "default" : "secondary"}
              className="gap-1.5 px-3"
            >
              <VisibilityIcon className="h-3 w-3" />
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-base text-muted-foreground max-w-2xl">
              {project.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {/* Branch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 -ml-2 hover:bg-accent"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{currentBranch}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                  <GitBranch className="h-4 w-4 mr-2" />
                  main
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GitBranch className="h-4 w-4 mr-2" />
                  develop
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Last Commit */}
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted">
                {commitHash}
              </code>
              <span className="text-xs">
                &quot;{lastCommitMessage}&quot;
              </span>
              <span className="text-xs">
                · {formatDistanceToNow(lastCommitTimestamp, { addSuffix: true })}
              </span>
            </div>

            {/* Contributors */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {contributors.map((contributor) => (
                  <Avatar
                    key={contributor.id}
                    className="h-6 w-6 border-2 border-background ring-1 ring-border"
                  >
                    <AvatarImage src={contributor.avatar} alt={contributor.name} />
                    <AvatarFallback className="text-xs">
                      {contributor.name}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs">
                {contributors.length} contributor{contributors.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-2">
            <Terminal className="h-4 w-4" />
            <span className="hidden sm:inline">Clone</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Visit</span>
          </Button>
          <Button size="sm" className="gap-2">
            <Rocket className="h-4 w-4" />
            Deploy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Copy Project ID
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}