// components/topbar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // Utility for class merging
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserButton } from '@clerk/nextjs'; // Clerk's UserButton for account management
import { ModeToggle } from '@/components/mode-toggle'; // Theme toggle

// Import Lucide icons based on the UI spec
import {
  Waypoints,    // For 'Push'
  Download,  // For 'Pull'
  Rocket,    // For 'Deploy'
  Search,
  Menu,      // For sidebar toggle
} from 'lucide-react';

// Define the interface for Topbar component props
interface TopbarProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

// Placeholder for Breadcrumb items (will be dynamic later)
const breadcrumbItems = [
  { label: "Project", href: "/dashboard" },
  { label: "Overview", href: "/dashboard" }, // Current page, no href or currentRoute logic needed here
];

// Placeholder for AccountMenu component.
// It will now receive isSidebarCollapsed to potentially adjust its display if needed.
function AccountMenu() {
  return (
    <div className="flex items-center space-x-2">
      <ModeToggle />
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}

// Topbar Component
export default function Topbar({ toggleSidebar, isSidebarCollapsed }: TopbarProps) {
  const pathname = usePathname(); // For potential dynamic breadcrumbs or active states

  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-background text-foreground shadow-sm">
      {/* Left Section: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Sidebar Toggle Button (visible on md screens and up) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex" // Only show on medium screens and up
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


      {/* Middle Section: Search Bar */}
      <div className="flex-1 max-w-sm mx-4">
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
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Push local snapshot">
            <Waypoints className="h-4 w-4 mr-2" />
            Push
          </Button>
          <Button variant="ghost" size="sm" title="Pull remote snapshot">
            <Download className="h-4 w-4 mr-2" />
            Pull
          </Button>
          <Button variant="default" size="sm">
            <Rocket className="h-4 w-4 mr-2" />
            Deploy
          </Button>
        </div>

        {/* Account Menu */}
        <AccountMenu />
      </div>
    </div>
  );
}