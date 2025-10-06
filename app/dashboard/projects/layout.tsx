// app/dashboard/projects/layout.tsx
"use client";

import React from 'react';

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

// This layout is specifically for the /dashboard/projects route and its sub-routes (like /new).
// It renders NO topbar and NO sidebar, providing a clean layout for project listing and creation.
export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-4 md:p-6 bg-background text-foreground">
        {children} {/* The project list or new project form will render here */}
      </main>
    </div>
  );
}