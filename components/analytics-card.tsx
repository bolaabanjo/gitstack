// components/analytics-card.tsx
"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  name: string;
  value: number;
}

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  data?: AnalyticsData[];
  icon?: React.ElementType;
  description?: string;
}

// Mock chart data
const mockData = [
  { name: "00:00", value: 400 },
  { name: "04:00", value: 300 },
  { name: "08:00", value: 600 },
  { name: "12:00", value: 800 },
  { name: "16:00", value: 700 },
  { name: "20:00", value: 900 },
];

export function AnalyticsCard({
  title,
  value,
  change,
  data = mockData,
  icon: Icon,
  description,
}: AnalyticsCardProps) {
  const isPositive = change && change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden group hover:border-primary/20 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
          </div>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Mini Chart */}
        <div className="h-[60px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorValue)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Observability Section Component
export function ObservabilitySection() {
  const metrics = [
    {
      title: "Edge Requests",
      value: "1.7K",
      change: 12.5,
      icon: Activity,
      description: "Last 24h",
    },
    {
      title: "Function Invocations",
      value: "67",
      change: -5.2,
      icon: Zap,
      description: "Last 24h",
    },
    {
      title: "Page Views",
      value: "2.3K",
      change: 8.3,
      icon: Eye,
      description: "Last 24h",
    },
    {
      title: "Error Rate",
      value: "0%",
      change: 0,
      icon: TrendingUp,
      description: "All systems operational",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Observability</h3>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <AnalyticsCard {...metric} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

