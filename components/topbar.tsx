// components/topbar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserButton } from '@clerk/nextjs';
import { ModeToggle } from '@/components/mode-toggle';

import {
  Search,
  Menu, // Import Menu icon
} from 'lucide-react';

interface TopbarProps {
  toggleSidebar: () => void; // Function to toggle the sidebar
  isSidebarCollapsed: boolean;
}

const breadcrumbItems = [
  { label: "Project", href: "/dashboard/projects" }, // Updated to projects list
  { label: "Code", href: "/dashboard/projects" },   // Updated to Code page
];

function AccountMenu() {
  return (
    <div className="flex items-center space-x-2">
      <ModeToggle />
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}

export default function Topbar({ toggleSidebar, isSidebarCollapsed }: TopbarProps) {
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-background text-foreground shadow-sm">
      {/* Left Section: Sidebar Toggle (Mobile) & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Mobile-only sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden" // Only show on mobile screens
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop sidebar toggle (already existed, ensure it hides on mobile if needed) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex" // Only show on desktop screens
          aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav aria-label="breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <span className="text-muted-foreground">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Middle Section: Search Bar (Responsive) */}
      <div className="flex-1 max-w-sm mx-4 rounded-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search snapshots, files, deployments..."
            className="w-full pl-9 h-9"
          />
        </div>
      </div>

      {/* Right Section: Action Buttons and Account Menu */}
      <div className="flex items-center space-x-4">
        {/* Account Menu */}
        <AccountMenu />
      </div>
    </div>
  );
}