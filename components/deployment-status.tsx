// components/deployment-status.tsx
"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  GitBranch,
  GitCommit,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type DeploymentStatus = "ready" | "building" | "error" | "queued";

interface DeploymentInfo {
  id: string;
  status: DeploymentStatus;
  domain: string;
  branch: string;
  commit: string;
  commitMessage: string;
  createdAt: Date;
  createdBy: {
    name: string;
    avatar: string;
  };
}

interface DeploymentStatusProps {
  deployment?: DeploymentInfo;
}

const statusConfig = {
  ready: {
    icon: CheckCircle2,
    label: "Ready",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  building: {
    icon: Clock,
    label: "Building",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  error: {
    icon: XCircle,
    label: "Error",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  queued: {
    icon: AlertCircle,
    label: "Queued",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
};

export function DeploymentStatus({ deployment }: DeploymentStatusProps) {
  // Mock deployment if none provided
  const mockDeployment: DeploymentInfo = deployment || {
    id: "dpl_abc123",
    status: "ready",
    domain: "gitstack.xyz",
    branch: "main",
    commit: "9e1675d",
    commitMessage: "feat: add file explorer component",
    createdAt: new Date(Date.now() - 3600000 * 3),
    createdBy: {
      name: "bolaabanjo",
      avatar: "https://github.com/shadcn.png",
    },
  };

  const config = statusConfig[mockDeployment.status];
  const StatusIcon = config.icon;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Production Deployment</CardTitle>
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            Instant
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-lg border p-4 transition-all",
            config.bgColor,
            config.borderColor
          )}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-5 w-5", config.color)} />
                <span className={cn("font-semibold", config.color)}>
                  {config.label}
                </span>
                {mockDeployment.status === "building" && (
                  <span className="text-sm text-muted-foreground">
                    (Building...)
                  </span>
                )}
              </div>

              {/* Domain */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Deployment</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">
                    {mockDeployment.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    asChild
                  >
                    <a
                      href={`https://${mockDeployment.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Domain link */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Domains</p>
                <a
                  href={`https://${mockDeployment.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {mockDeployment.domain}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Status info */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium">
                    {mockDeployment.status === "ready" && "Deployment completed"}
                    {mockDeployment.status === "building" && "Build in progress"}
                    {mockDeployment.status === "error" && "Build failed"}
                    {mockDeployment.status === "queued" && "Waiting in queue"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(mockDeployment.createdAt, {
                      addSuffix: true,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {mockDeployment.createdBy.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Source Info */}
        <div className="space-y-3 rounded-lg border border-border/50 p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Source
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <code className="text-sm font-mono">{mockDeployment.branch}</code>
            </div>
            <div className="flex items-start gap-2">
              <GitCommit className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <code className="text-sm font-mono text-primary">
                  {mockDeployment.commit}
                </code>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {mockDeployment.commitMessage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            Build Logs
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Runtime Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

