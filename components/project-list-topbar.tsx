// components/project-list-topbar.tsx
"use client";

import React from 'react';
import { UserButton } from '@clerk/nextjs'; // Clerk's UserButton for account management
import { ModeToggle } from '@/components/mode-toggle'; // Theme toggle
import { Input } from '@/components/ui/input'; // Shadcn Input component
import { Search } from 'lucide-react'; // Lucide Search icon

// This Topbar component is specifically for the /dashboard/projects list page.
// It features only the user button, theme toggle, and a project search bar.

interface ProjectListTopbarProps {
  // We don't need toggleSidebar or isSidebarCollapsed here as there's no sidebar to toggle
  // Optional: A search handler can be passed if search logic lives higher up
  onSearch?: (query: string) => void;
}

export default function ProjectListTopbar({ onSearch }: ProjectListTopbarProps) {
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-background text-foreground shadow-sm">
      {/* Left Section: Branding or Placeholder (Empty for now as per spec) */}
      <div className="flex-1 max-w-sm mr-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your projects..."
            className="w-full pl-9 h-9"
            onChange={(e) => onSearch?.(e.target.value)} // Pass search query up
          />
        </div>
      </div>

      {/* Right Section: User Button and Theme Toggle */}
      <div className="flex items-center space-x-4">
        <ModeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}