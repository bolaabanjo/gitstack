// app/dashboard/projects/layout.tsx
"use client";

import React from 'react';

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

// Projects list and creation pages: Topbar controlled by each page; no sidebar here.
export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">{children}</main>
    </div>
  );
}