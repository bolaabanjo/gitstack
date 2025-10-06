// components/sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

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
} from 'lucide-react';

// Map icon names to Lucide components
const IconMap: { [key: string]: React.ElementType } = {
  home: Home,
  camera: Camera,
  rocket: Rocket,
  diff: GitCompare,
  sparkles: Sparkles,
  cog: Cog,
  users: Users,
  settings: Settings,
  plus: PlusCircle,
};

// Navigation data
const globalNavItems = [
  { id: "projects", label: "Projects", icon: "home", route: "/dashboard/projects" },
];

const getProjectNavItems = (projectId: string) => [
  { id: "code", label: "Code", icon: "home", route: `/dashboard/projects/${projectId}/code` },
  { id: "snapshots", label: "Snapshots", icon: "camera", route: `/dashboard/projects/${projectId}/snapshots` },
  { id: "deployments", label: "Deployments", icon: "rocket", route: `/dashboard/projects/${projectId}/deployments` },
  { id: "diffs", label: "Diffs", icon: "diff", route: `/dashboard/projects/${projectId}/diffs` },
  { id: "ai", label: "AI Explain", icon: "sparkles", route: `/dashboard/projects/${projectId}/ai` },
  { id: "project-settings", label: "Settings", icon: "cog", route: `/dashboard/projects/${projectId}/settings` },
];

const accountNavItems = [
  { id: "account-settings", label: "Settings", icon: "settings", route: "/dashboard/settings" },
  { id: "team-management", label: "Team", icon: "users", route: "/dashboard/team" },
];

// Sidebar Component - Uses shadcn/ui sidebar hooks properly
export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = typeof params.projectId === 'string' ? params.projectId : null;
  const { user, isSignedIn } = useUser();
  const { state } = useSidebar(); // Get current sidebar state

  const userDisplayName = user?.fullName || user?.emailAddresses[0]?.emailAddress || "User";
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const projectNavItems = projectId ? getProjectNavItems(projectId) : [];

  const handleNewSnapshot = () => {
    console.log("Open New Snapshot Modal");
  };

  return (
    <>
      {/* Header with Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/sdark.png"
                    alt="Gitstack"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Gitstack</span>
                  <span className="truncate text-xs text-muted-foreground">Version Control</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent>
        {/* Global Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {globalNavItems.map((item) => {
                const IconComponent = IconMap[item.icon];
                const isActive = pathname === item.route;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.route}>
                        {IconComponent && <IconComponent />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Project-Specific Navigation */}
        {projectId && projectNavItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Current Project</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projectNavItems.map((item) => {
                    const IconComponent = IconMap[item.icon];
                    const isActive = pathname.startsWith(item.route);
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.route}>
                            {IconComponent && <IconComponent />}
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Account Navigation */}
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item) => {
                const IconComponent = IconMap[item.icon];
                const isActive = pathname === item.route;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.route}>
                        {IconComponent && <IconComponent />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with CTA and User Profile */}
      <SidebarFooter>
        {/* New Snapshot Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleNewSnapshot} className="w-full">
              <PlusCircle />
              <span>New Snapshot</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Profile */}
        {isSignedIn && (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <UserButton afterSignOutUrl="/" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userDisplayName}</span>
                  {userEmail && (
                    <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  )}
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </>
  );
}