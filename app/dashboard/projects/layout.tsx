// app/dashboard/projects/layout.tsx
"use client";

import React from 'react';
import ProjectListTopbar from '@/components/project-list-topbar';

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

// Projects list and creation pages: Topbar only, no sidebar.
export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <ProjectListTopbar />
      <main className="flex-grow p-4 md:p-6 bg-background text-foreground">
        {children}
      </main>
    </div>
  );
}