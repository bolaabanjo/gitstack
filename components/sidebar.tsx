// components/sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import Lucide icons
import {
  Home,
  Camera,
  Rocket,
  GitCompare,
  Sparkles,
  Cog,
  Users,
  PlusCircle,
  Settings,
  Boxes,
} from 'lucide-react';

// Define the interface for Sidebar component props
interface SidebarProps {
  isCollapsed: boolean;
}

// Map icon names to Lucide components
const IconMap: { [key: string]: React.ElementType } = {
  home: Home,
  camera: Camera,
  rocket: Rocket,
  diff: GitCompare,
  sparkles: Sparkles,
  cog: Cog,
  users: Users,
  camera_plus: PlusCircle,
  settings: Settings,
  boxes: Boxes,
};

// Global navigation items
const globalNavItems = [
  { id: "projects", label: "Projects", icon: "home", route: "/dashboard/projects" },
];

// Project-specific navigation items
const getProjectNavItems = (projectId: string) => [
  { id: "overview", label: "Overview", icon: "home", route: `/dashboard/projects/${projectId}/overview` },
  { id: "snapshots", label: "Snapshots", icon: "camera", route: `/dashboard/projects/${projectId}/snapshots` },
  { id: "deployments", label: "Deployments", icon: "rocket", route: `/dashboard/projects/${projectId}/deployments` },
  { id: "diffs", label: "Diffs & Changes", icon: "diff", route: `/dashboard/projects/${projectId}/diffs` },
  { id: "ai", label: "AI Explain", icon: "sparkles", route: `/dashboard/projects/${projectId}/ai` },
  { id: "project-settings", label: "Settings", icon: "cog", route: `/dashboard/projects/${projectId}/settings` },
];

// Account navigation items
const accountNavItems = [
  { id: "account-settings", label: "Settings", icon: "settings", route: "/dashboard/settings" },
  { id: "team-management", label: "Team", icon: "users", route: "/dashboard/team" },
];

// Navigation button component with tooltip support
function NavButton({ 
  item, 
  isActive, 
  isCollapsed 
}: { 
  item: { id: string; label: string; icon: string; route: string }; 
  isActive: boolean; 
  isCollapsed: boolean;
}) {
  const IconComponent = IconMap[item.icon];
  
  const button = (
    <Link href={item.route} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full text-sm font-normal transition-all",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
          isCollapsed ? "justify-center px-2 h-10 w-10" : "justify-start px-3 h-9"
        )}
      >
        {IconComponent && <IconComponent className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-3")} />}
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </Button>
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-normal">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

// Sidebar Component
export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = typeof params.projectId === 'string' ? params.projectId : null;

  const { user, isSignedIn } = useUser();

  const handleNewSnapshot = () => {
    console.log("Open New Snapshot Modal");
  };

  const userDisplayName = user?.fullName || user?.emailAddresses[0]?.emailAddress || "User";
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  const projectNavItems = projectId ? getProjectNavItems(projectId) : [];

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo Section */}
      <div className={cn(
        "flex items-center border-b border-border transition-all",
        isCollapsed ? "h-16 justify-center px-2" : "h-16 px-4 space-x-2"
      )}>
        <Link href="/dashboard" className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-2"
        )}>
          <Image
            src="/sdark.png"
            alt="Gitstack Logo"
            width={28}
            height={28}
            className="h-7 w-7 flex-shrink-0"
            priority
          />
          {!isCollapsed && (
            <span className="text-xl font-bold whitespace-nowrap">Gitstack</span>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className={cn("flex flex-col space-y-1", isCollapsed ? "px-2" : "px-3")}>
          {/* Global Navigation */}
          <div className="pb-2">
            {!isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace
              </h3>
            )}
            <div className="space-y-1">
              {globalNavItems.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  isActive={pathname === item.route}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>

          {/* Project-Specific Navigation */}
          {projectId && projectNavItems.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="pb-2">
                {!isCollapsed && (
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Project
                  </h3>
                )}
                <div className="space-y-1">
                  {projectNavItems.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      isActive={pathname.startsWith(item.route)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Account Navigation */}
          <Separator className="my-2" />
          <div className="pb-2">
            {!isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </h3>
            )}
            <div className="space-y-1">
              {accountNavItems.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  isActive={pathname === item.route}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* CTA Button */}
      <div className={cn("border-t border-border", isCollapsed ? "p-2" : "p-3")}>
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleNewSnapshot} 
                  size="icon"
                  className="w-10 h-10"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                New Snapshot
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button onClick={handleNewSnapshot} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Snapshot
          </Button>
        )}
      </div>

      {/* User Profile */}
      {isSignedIn && (
        <div className={cn(
          "border-t border-border",
          isCollapsed ? "p-2 flex justify-center" : "p-3 flex items-center space-x-3"
        )}>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: isCollapsed ? "w-8 h-8" : "w-9 h-9"
              }
            }}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userDisplayName}</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}