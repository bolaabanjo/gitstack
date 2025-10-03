// components/sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams } from 'next/navigation'; // Added useParams
import { cn } from '@/lib/utils'; // Assuming this utility for class merging
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, UserButton } from '@clerk/nextjs'; // For user profile and menu

// Import Lucide icons based on the UI spec
import {
  Home,
  Camera,
  Rocket,
  GitCompare,
  Sparkles,
  Cog,
  Users,
  PlusCircle,
  LogOut,
  Settings, // Using Settings for global settings, Wrench for project settings
  Boxes,
} from 'lucide-react';

// Define the interface for Sidebar component props
interface SidebarProps {
  isCollapsed: boolean;
}

// Map icon names from spec to Lucide components
const IconMap: { [key: string]: React.ElementType } = {
  home: Home,
  camera: Camera,
  rocket: Rocket,
  diff: GitCompare,
  sparkles: Sparkles,
  cog: Cog, // Re-used for both global and project settings for now, can be differentiated later
  users: Users,
  camera_plus: PlusCircle,
  logout: LogOut,
  settings: Settings,
  boxes: Boxes,
};

// --- Navigation Data Structure ---
// Global navigation items (always visible)
const globalNavItems = [
  { id: "projects", label: "Projects", icon: "home", route: "/dashboard/projects" },
];

// Function to generate project-specific navigation items
const getProjectNavItems = (projectId: string) => [
  { id: "overview", label: "Overview", icon: "home", route: `/dashboard/projects/${projectId}/overview` },
  { id: "snapshots", label: "Snapshots", icon: "camera", route: `/dashboard/projects/${projectId}/snapshots` },
  { id: "deployments", label: "Deployments", icon: "rocket", route: `/dashboard/projects/${projectId}/deployments` },
  { id: "diffs", label: "Diffs & Changes", icon: "diff", route: `/dashboard/projects/${projectId}/diffs` },
  { id: "ai", label: "AI Explain", icon: "sparkles", route: `/dashboard/projects/${projectId}/ai` },
  { id: "project-settings", label: "Project Settings", icon: "cog", route: `/dashboard/projects/${projectId}/settings` },
];

// Account-specific navigation items (always visible)
const accountNavItems = [
  { id: "account-settings", label: "Account Settings", icon: "settings", route: "/dashboard/settings" },
  { id: "team-management", label: "Team Management", icon: "users", route: "/dashboard/team" },
];

// Sidebar Component
export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams(); // Get URL parameters
  const projectId = typeof params.projectId === 'string' ? params.projectId : null; // Extract projectId

  const { user, isSignedIn } = useUser();

  // Function to handle the "New Snapshot" CTA action (e.g., open a modal)
  const handleNewSnapshot = () => {
    console.log("Open New Snapshot Modal");
    // In a real application, this would open a modal or trigger a state change.
  };

  const userDisplayName = user?.fullName || user?.emailAddresses[0]?.emailAddress || "User";
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  // Determine which project navigation items to display
  const projectNavItems = projectId ? getProjectNavItems(projectId) : [];

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo Section */}
      <div className={cn("flex items-center p-4 h-16 border-b border-border",
        isCollapsed ? "justify-center" : "justify-start space-x-2"
      )}>
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/sdark.png"
            alt="Gitstack Logo"
            width={28}
            height={28}
            className="h-7 w-auto"
            priority
          />
          {!isCollapsed && (
            <span className="text-xl font-bold whitespace-nowrap">Gitstack</span>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <ScrollArea className="flex-grow py-4">
        <nav className="flex flex-col space-y-2 px-4">
          {/* Global Navigation: Projects */}
          <div className="pb-4">
            {!isCollapsed && (
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace
              </h3>
            )}
            <div className="space-y-1">
              {globalNavItems.map((item) => {
                const IconComponent = IconMap[item.icon];
                const isActive = pathname === item.route;
                return (
                  <Link key={item.id} href={item.route} passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-normal py-2 px-2",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                        isCollapsed && "justify-center"
                      )}
                    >
                      {IconComponent && <IconComponent className={cn("h-4 w-4", !isCollapsed && "mr-3")} />}
                      {!isCollapsed && item.label}
                      {isCollapsed && <span className="sr-only">{item.label}</span>}
                    </Button>
                  </Link>
                );
              })}
            </div>
            {/* Separator if project-specific items are present */}
            {projectId && !isCollapsed && <Separator className="my-4" />}
          </div>

          {/* Project-Specific Navigation (only if a project is selected) */}
          {projectId && (
            <div className="pb-4">
              {!isCollapsed && (
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Project
                </h3>
              )}
              <div className="space-y-1">
                {projectNavItems.map((item) => {
                  const IconComponent = IconMap[item.icon];
                  // Adjust isActive check for nested routes
                  const isActive = pathname.startsWith(item.route);
                  return (
                    <Link key={item.id} href={item.route} passHref>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm font-normal py-2 px-2",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                          isCollapsed && "justify-center"
                        )}
                      >
                        {IconComponent && <IconComponent className={cn("h-4 w-4", !isCollapsed && "mr-3")} />}
                        {!isCollapsed && item.label}
                        {isCollapsed && <span className="sr-only">{item.label}</span>}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              {!isCollapsed && <Separator className="my-4" />}
            </div>
          )}


          {/* Account Navigation */}
          <div className="pb-4">
            {!isCollapsed && (
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </h3>
            )}
            <div className="space-y-1">
              {accountNavItems.map((item) => {
                const IconComponent = IconMap[item.icon];
                const isActive = pathname === item.route;
                return (
                  <Link key={item.id} href={item.route} passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-normal py-2 px-2",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                        isCollapsed && "justify-center"
                      )}
                    >
                      {IconComponent && <IconComponent className={cn("h-4 w-4", !isCollapsed && "mr-3")} />}
                      {!isCollapsed && item.label}
                      {isCollapsed && <span className="sr-only">{item.label}</span>}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </ScrollArea>

      {/* CTA Button */}
      <div className={cn("p-4 border-t border-border mt-auto", isCollapsed && "flex justify-center")}>
        <Button onClick={handleNewSnapshot} className="w-full text-sm">
          <PlusCircle className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "New Snapshot"}
          {isCollapsed && <span className="sr-only">New Snapshot</span>}
        </Button>
      </div>

      {/* Profile at the Footer of the Sidebar */}
      {isSignedIn && (
        <div className={cn("p-4 border-t border-border",
          isCollapsed ? "flex justify-center" : "flex items-center space-x-3"
        )}>
          <UserButton afterSignOutUrl="/" />
          {!isCollapsed && (
            <div className="flex-grow flex flex-col justify-center">
              <p className="text-sm font-medium leading-none">{userDisplayName}</p>
              {userEmail && <p className="text-xs text-muted-foreground leading-none">{userEmail}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}