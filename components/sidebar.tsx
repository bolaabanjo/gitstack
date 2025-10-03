// components/sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming this utility for class merging
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
// Removed: import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // No longer needed
import { useUser, UserButton } from '@clerk/nextjs'; // For user profile and menu

// Import Lucide icons based on the UI spec
import {
  Home,
  Camera,
  Rocket,
  GitCompare,
  Sparkles,
  Wrench,
  Boxes,
  PlusCircle,
  LogOut,
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
  wrench: Wrench,
  boxes: Boxes,
  camera_plus: PlusCircle,
  logout: LogOut,
};

// Navigation data based on the UI spec
const navGroups = [
  {
    label: "Project",
    items: [
      { id: "dashboard", label: "Overview", icon: "home", route: "/dashboard" },
      { id: "snapshots", label: "Snapshots", icon: "camera", route: "/dashboard/snapshots" },
      { id: "deployments", label: "Deployments", icon: "rocket", route: "/dashboard/deployments" },
      { id: "diffs", label: "Diffs & Changes", icon: "diff", route: "/dashboard/diffs" },
      { id: "ai", label: "AI Explain", icon: "sparkles", route: "/dashboard/ai" },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "settings", label: "Settings", icon: "wrench", route: "/dashboard/settings" },
      { id: "team", label: "Team", icon: "boxes", route: "/dashboard/team" },
    ],
  },
];

// Sidebar Component
export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser(); // Get user details for profile footer

  // Function to handle the "New Snapshot" CTA action (e.g., open a modal)
  const handleNewSnapshot = () => {
    console.log("Open New Snapshot Modal");
    // Example: dispatch(openModal('SnapshotModal'));
  };

  const userDisplayName = user?.fullName || user?.emailAddresses[0]?.emailAddress || "User";
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo Section */}
      <div className={cn("flex items-center p-4 h-16 border-b border-border",
        isCollapsed ? "justify-center" : "justify-start space-x-2"
      )}>
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/sdark.png" // Using the dark logo as per previous change
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
          {navGroups.map((group, index) => (
            <div key={group.label} className="pb-4">
              {!isCollapsed && (
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h3>
              )}
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
              {/* Add separator between groups if not the last group */}
              {index < navGroups.length - 1 && !isCollapsed && <Separator className="my-4" />}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* CTA Button */}
      <div className="p-4 border-t border-border mt-auto">
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
          {/* Clerk UserButton: This renders the user's avatar and a dropdown menu */}
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