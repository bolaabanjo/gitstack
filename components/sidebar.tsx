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

import {
  Code,
  Camera,
  Rocket,
  GitCompare,
  Drone,
  Cog,
  Boxes,
  PlusCircle,
  Settings,
  GalleryVerticalEnd,
  Wrench,
} from 'lucide-react';

// Icon map
const IconMap: { [key: string]: React.ElementType } = {
  code: Code,
  camera: Camera,
  rocket: Rocket,
  diff: GitCompare,
  drone: Drone,
  cog: Cog,
  boxes: Boxes,
  settings: Settings,
  plus: PlusCircle,
  galleryVerticalEnd: GalleryVerticalEnd,
  wrench: Wrench,
};

// Navigation data
const globalNavItems = [
  { id: "projects", label: "Projects", icon: "galleryVerticalEnd", route: "/dashboard/projects" },
];

const getProjectNavItems = (projectId: string) => [
  { id: "code", label: "Code", icon: "code", route: `/dashboard/projects/${projectId}/code` },
  { id: "snapshots", label: "Snapshots", icon: "camera", route: `/dashboard/projects/${projectId}/snapshots` },
  { id: "deployments", label: "Deployments", icon: "rocket", route: `/dashboard/projects/${projectId}/deployments` },
  { id: "diffs", label: "Diffs", icon: "diff", route: `/dashboard/projects/${projectId}/diffs` },
  { id: "ai", label: "AI", icon: "drone", route: `/dashboard/projects/${projectId}/ai` },
  { id: "project-settings", label: "Settings", icon: "wrench", route: `/dashboard/projects/${projectId}/settings` },
];

const accountNavItems = [
  { id: "account-settings", label: "Settings", icon: "settings", route: "/dashboard/settings" },
  { id: "team-management", label: "Team", icon: "boxes", route: "/dashboard/team" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = typeof params.projectId === 'string' ? params.projectId : null;
  const { user, isSignedIn } = useUser();
  useSidebar();

  const userDisplayName = user?.fullName || user?.emailAddresses[0]?.emailAddress || "User";
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const projectNavItems = projectId ? getProjectNavItems(projectId) : [];

  const handleNewSnapshot = () => {
    console.log("Open New Snapshot Modal");
  };

  return (
    <div className="h-full overflow-x-hidden"> {/* prevents horizontal scrollbar */}

      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/sdark.png"
                    alt="Gitstack"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
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

      {/* Footer */}
      <SidebarFooter>
        {/* New Snapshot Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleNewSnapshot} 
              className="w-full overflow-hidden"
            >
              <PlusCircle />
              <span className="truncate">New Snapshot</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Profile */}
        {isSignedIn && (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5 overflow-hidden">
                <UserButton afterSignOutUrl="/" />
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0 overflow-hidden">
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
    </div>
  );
}
