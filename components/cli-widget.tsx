   "use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Copy,
  Check,
  RefreshCw,
  GitCommit,
  Upload,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface CLIActivity {
  id: string;
  command: string;
  status: "success" | "pending" | "error";
  timestamp: Date;
  message: string;
}

interface CLIWidgetProps {
  // projectId: string; // Removed or renamed to _projectId as it's not directly used
  _projectId?: string; // Renamed to _projectId to indicate it's unused but passed
}

export function CLIWidget({ _projectId }: CLIWidgetProps) { // Destructure as _projectId
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

      // Mock CLI activities - replace with real API data
      const mockActivities: CLIActivity[] = [
        {
          id: "1",
          command: "gitstack snap",
          status: "success",
          timestamp: new Date(Date.now() - 7200000),
          message: "Snapshot created successfully",
        },
        {
          id: "2",
          command: "gitstack push",
          status: "pending",
          timestamp: new Date(Date.now() - 3600000),
          message: "Push in progress...",
        },
        {
          id: "3",
          command: "gitstack diff",
          status: "success",
          timestamp: new Date(Date.now() - 86400000),
          message: "12 files changed",
        },
      ];

      const quickCommands = [
        {
          label: "Create Snapshot",
          command: `gitstack snap -m "New snapshot"`,
          icon: GitCommit,
        },
        {
          label: "Push Changes",
          command: `gitstack push`,
          icon: Upload,
        },
        {
          label: "Pull Latest",
          command: `gitstack pull`,
          icon: Download,
        },
      ];

      const copyToClipboard = async (text: string) => {
        try {
          await navigator.clipboard.writeText(text);
          setCopiedCommand(text);
          setTimeout(() => setCopiedCommand(null), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      };

      const getStatusIcon = (status: CLIActivity["status"]) => {
        switch (status) {
          case "success":
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
          case "pending":
            return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
          case "error":
            return <XCircle className="h-4 w-4 text-destructive" />;
        }
      };

      const getStatusBadge = (status: CLIActivity["status"]) => {
        switch (status) {
          case "success":
            return <Badge variant="default" className="bg-green-500">Success</Badge>;
          case "pending":
            return <Badge variant="secondary" className="bg-yellow-500">Pending</Badge>;
          case "error":
            return <Badge variant="destructive">Error</Badge>;
        }
      };

      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                <CardTitle>CLI Activity</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Recent commands and quick actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Commands */}
            <div>
              <h4 className="text-sm font-medium mb-3">Quick Commands</h4>
              <div className="space-y-2">
                {quickCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  const isCopied = copiedCommand === cmd.command;
                  
                  return (
                    <div
                      key={cmd.command}
                      className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2.5 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{cmd.label}</p>
                          <code className="text-xs text-muted-foreground font-mono truncate block">
                            {cmd.command}
                          </code>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => copyToClipboard(cmd.command)}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </h4>
              <div className="space-y-2">
                {mockActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No CLI activity yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Run commands from your terminal to see them here
                    </p>
                  </div>
                ) : (
                  mockActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getStatusIcon(activity.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm font-mono font-medium">
                                {activity.command}
                              </code>
                              {getStatusBadge(activity.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {activity.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Setup Instructions (if no activity) */}
            {mockActivities.length === 0 && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-start gap-3">
                  <Terminal className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium mb-2">Get Started with CLI</h5>
                    <p className="text-xs text-muted-foreground mb-3">
                      Initialize this project and start tracking your changes:
                    </p>
                    <div className="rounded-md bg-muted p-3 font-mono text-xs space-y-1">
                      <div className="flex items-center justify-between group">
                        <span className="text-muted-foreground">$ gitstack init</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => copyToClipboard("gitstack init")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between group">
                        <span className="text-muted-foreground">$ gitstack snap -m &quot;Initial commit&quot;</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => copyToClipboard('gitstack snap -m "Initial commit"')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }