// components/firewall-widget.tsx
"use client";

import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FirewallWidgetProps {
  isActive?: boolean;
  deniedCount?: number;
  timeRange?: string;
}

export function FirewallWidget({
  isActive = true,
  deniedCount = 262,
  timeRange = "24h",
}: FirewallWidgetProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/20 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Firewall</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {timeRange}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            Enable Bot Protection
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "rounded-lg border p-6 flex flex-col items-center justify-center gap-4 transition-all",
            isActive
              ? "bg-green-500/5 border-green-500/20"
              : "bg-muted/50 border-border"
          )}
        >
          <div
            className={cn(
              "rounded-full p-4 transition-all",
              isActive ? "bg-green-500/10" : "bg-muted"
            )}
          >
            {isActive ? (
              <ShieldCheck className="h-10 w-10 text-green-500" />
            ) : (
              <Shield className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p
              className={cn(
                "text-lg font-semibold mb-1",
                isActive ? "text-green-500" : "text-muted-foreground"
              )}
            >
              {isActive ? "Firewall is active" : "Firewall is disabled"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? "Your application is protected"
                : "Enable firewall to protect your app"}
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{deniedCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">denied</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full justify-between" size="sm">
              <span>View Firewall Logs</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Enable CTA */}
        {!isActive && (
          <Button className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Enable Firewall
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

