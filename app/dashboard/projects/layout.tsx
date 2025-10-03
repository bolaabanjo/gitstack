// app/dashboard/projects/layout.tsx
"use client";

import React from 'react';
import ProjectListTopbar from '@/components/project-list-topbar'; // Import the new topbar component

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

// This layout is specifically for the /dashboard/projects route and its sub-routes.
// It overrides the parent /dashboard/layout.tsx to remove the sidebar
// and use a simplified topbar for project listing/creation.
export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  // You can add state here for search queries if you want the search bar
  // in ProjectListTopbar to filter the projects displayed in app/dashboard/projects/page.tsx
  // For simplicity, we'll just render the children, assuming search is handled by page.tsx
  // or a context if more complex.

  // Example for search functionality (if needed in the future):
  // const [searchQuery, setSearchQuery] = useState('');
  // return (
  //   <div className="flex flex-col min-h-screen">
  //     <ProjectListTopbar onSearch={setSearchQuery} />
  //     <main className="flex-grow p-4 md:p-6 bg-background text-foreground">
  //       {React.Children.map(children, child =>
  //         React.cloneElement(child as React.ReactElement, { searchQuery })
  //       )}
  //     </main>
  //   </div>
  // );

  return (
    <div className="flex flex-col min-h-screen">
      {/* This topbar does NOT have a sidebar toggle */}
      <ProjectListTopbar />
      <main className="flex-grow p-4 md:p-6 bg-background text-foreground">
        {children} {/* The project list or new project form will render here */}
      </main>
    </div>
  );
}