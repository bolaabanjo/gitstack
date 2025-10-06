// components/topbar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
// Removed: import { usePathname } from 'next/navigation'; // This import was already removed, confirming no longer needed
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserButton } from '@clerk/nextjs';
import { ModeToggle } from '@/components/mode-toggle';

import {
  Upload,
  Download,
  Rocket,
  Search,
  Menu,
} from 'lucide-react';

interface TopbarProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const breadcrumbItems = [
  { label: "Project", href: "/dashboard" },
  { label: "Overview", href: "/dashboard" },
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
  // Removed: const pathname = usePathname(); // Remove this line
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-background text-foreground shadow-sm">
      {/* Left Section: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex"
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

        {/* Account Menu */}
        <AccountMenu />
      </div>
    </div>
  );
}