// app/dashboard/layout.tsx

"use client"; // This layout will use client-side hooks and interactive components

import React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Placeholder imports for Sidebar and Topbar components
// We'll create these files in '@/components/' later
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';
import { useState } from 'react'; // Import useState

// This layout defines the structure for all pages under the /dashboard route.
// It implements a two-column layout: a fixed-width sidebar on the left,
// and a main content area (with a topbar and page-specific content) on the right.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false); // State to manage sidebar collapse

  return (
    <ResizablePanelGroup
      direction="horizontal" // Panels are arranged horizontally
      className="min-h-screen items-stretch" // Ensure it takes full viewport height
    >
      {/* Left Panel: Sidebar */}
      <ResizablePanel
        defaultSize={15} // Approx. 15% of width, adjust as needed or use minSize/maxSize
        collapsedSize={3} // Collapsed size (e.g., 3% of width for icons)
        collapsible={true}
        minSize={12} // Minimum size to prevent sidebar from becoming too small
        maxSize={20} // Maximum size to prevent sidebar from becoming too wide
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        className="hidden md:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground" // Apply base styling, hide on small screens
      >
        <Sidebar /> {/* Our Sidebar component will go here */}
      </ResizablePanel>

      <ResizableHandle withHandle /> {/* Handle to resize the panels */}

      {/* Right Panel: Main Content Area (Topbar + Children) */}
      <ResizablePanel defaultSize={85}> {/* Remaining width for main content */}
        <div className="flex flex-col min-h-screen">
          <Topbar /> {/* Our Topbar component will go here */}
          <main className="flex-grow p-4 md:p-6 bg-background text-foreground">
            {children} {/* The actual page content will be rendered here */}
          </main>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}