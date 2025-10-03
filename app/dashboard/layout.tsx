// app/dashboard/layout.tsx

"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils'; // Assuming this utility for class merging

// Placeholder imports for Sidebar and Topbar components
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // State to manage sidebar collapse/expand status
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to toggle the sidebar's collapsed state
  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  // Define fixed widths for the sidebar based on its collapsed state
  // Tailwind's w-64 is 256px, w-20 is 80px (common values for expanded/collapsed)
  const sidebarWidthClass = isCollapsed ? 'w-20' : 'w-64';

  // Define the left margin for the main content area to prevent it from
  // overlapping with the fixed sidebar. This also needs to change with collapse state.
  const mainContentMarginClass = isCollapsed ? 'ml-20' : 'ml-64';

  return (
    <div className="flex min-h-screen">
      {/* Fixed Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full flex-shrink-0 border-r border-border bg-sidebar text-sidebar-foreground",
          "transition-all duration-200 ease-in-out", // Smooth transition for width changes
          sidebarWidthClass, // Apply dynamic width
          "hidden md:flex flex-col" // Hide on small screens, always a flex column
        )}
      >
        {/* The Sidebar component receives the collapsed state */}
        <Sidebar isCollapsed={isCollapsed} />
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col flex-1", // Take remaining width, arrange children vertically
          mainContentMarginClass, // Apply dynamic left margin
          "transition-all duration-200 ease-in-out" // Smooth transition for margin changes
        )}
      >
        {/* The Topbar component receives the toggle function and sidebar's collapsed state */}
        <Topbar toggleSidebar={toggleSidebar} isSidebarCollapsed={isCollapsed} />
        <main className="flex-grow p-4 md:p-6 bg-background text-foreground overflow-auto">
          {/* The actual page content will be rendered here */}
          {children}
        </main>
      </div>
    </div>
  );
}