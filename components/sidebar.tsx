// components/sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming this utility for class merging
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area'; // For potentially long sidebars

// Import Lucide icons based on the UI spec
import {
  Home,
  Camera,
  Rocket,
  GitCompare, // Assuming 'diff' maps to GitDiff
  Sparkles,
  Cog,      // Assuming 'cog' maps to Cog
  Users,
  PlusCircle, // For 'camera_plus' (New Snapshot CTA)
} from 'lucide-react';

// Map icon names from spec to Lucide components
const IconMap: { [key: string]: React.ElementType } = {
  home: Home,
  camera: Camera,
  rocket: Rocket,
  diff: GitCompare,
  sparkles: Sparkles,
  cog: Cog,
  users: Users,
  camera_plus: PlusCircle,
};

// Navigation data based on the UI spec
const navGroups = [
  {
    label: "Project",
    items: [
      { id: "dashboard", label: "Overview", icon: "home", route: "/dashboard" }, // Adjusted to /dashboard
      { id: "snapshots", label: "Snapshots", icon: "camera", route: "/dashboard/snapshots" },
      { id: "deployments", label: "Deployments", icon: "rocket", route: "/dashboard/deployments" },
      { id: "diffs", label: "Diffs & Changes", icon: "diff", route: "/dashboard/diffs" },
      { id: "ai", label: "AI Explain", icon: "sparkles", route: "/dashboard/ai" },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "settings", label: "Settings", icon: "cog", route: "/dashboard/settings" },
      { id: "team", label: "Team", icon: "users", route: "/dashboard/team" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname(); // Hook to get the current active route

  // Function to handle the "New Snapshot" CTA action (e.g., open a modal)
  const handleNewSnapshot = () => {
    // In a real application, this would open a modal or trigger a state change.
    console.log("Open New Snapshot Modal");
    // Example: dispatch(openModal('SnapshotModal'));
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo Section */}
      <div className="flex items-center justify-center p-4 h-16 border-b border-border">
        <Link href="/dashboard" className="flex items-center space-x-2">
          {/* Using a generic logo here. Replace with your actual /logo.svg */}
          <Image
            src="/sdark.png" // Make sure you have this image in your public folder
            alt="Gitstack Logo"
            width={28}
            height={28}
            className="h-7 w-auto"
            priority
          />
          <span className="text-xl font-bold">Gitstack</span>
        </Link>
      </div>

      {/* Navigation Groups */}
      <ScrollArea className="flex-grow py-4">
        <nav className="flex flex-col space-y-2 px-4">
          {navGroups.map((group, index) => (
            <div key={group.label} className="pb-4">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const IconComponent = IconMap[item.icon];
                  const isActive = pathname === item.route;
                  return (
                    <Link key={item.id} href={item.route} passHref>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm font-normal py-2 px-2",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        {IconComponent && <IconComponent className="mr-3 h-4 w-4" />}
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              {/* Add separator between groups if not the last group */}
              {index < navGroups.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* CTA Button */}
      <div className="p-4 border-t border-border mt-auto">
        <Button onClick={handleNewSnapshot} className="w-full text-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Snapshot
        </Button>
      </div>
    </div>
  );
}