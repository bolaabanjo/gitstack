// app/dashboard/layout.tsx

"use client";

import React from 'react'; // Removed useState as it's no longer used here
// Removed: import { cn } from '@/lib/utils';
// Removed: import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
// Removed: import Sidebar from '@/components/sidebar';
// Removed: import Topbar from '@/components/topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// This layout now serves as a minimal wrapper for all dashboard routes,
// providing necessary client-side contexts (e.g., authentication) but
// NOT dictating the main structural layout (sidebar, topbar).
// That structural layout is now managed by more specific nested layouts.
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Removed: State and functions for sidebar collapse as they belong in a more specific layout

  return (
    <div className="min-h-screen">
      {/* This layout no longer contains the Sidebar or Topbar. */}
      {/* It primarily ensures the client-side context for its children. */}
      {children}
    </div>
  );
}