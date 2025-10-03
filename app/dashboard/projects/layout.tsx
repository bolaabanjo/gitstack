// app/dashboard/projects/layout.tsx
"use client";

import React from 'react';
import ProjectListTopbar from '@/components/project-list-topbar'; // Import the dedicated topbar

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

// This layout is specifically for the /dashboard/projects route and its sub-routes (like /new).
// It renders a simplified topbar and no sidebar, overriding the parent dashboard layout's structure.
export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* This topbar is specific to the project list/creation pages */}
      <ProjectListTopbar />
      <main className="flex-grow p-4 md:p-6 bg-background text-foreground">
        {children} {/* The project list or new project form will render here */}
      </main>
    </div>
  );
}