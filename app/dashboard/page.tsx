// app/dashboard/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Optional: for a subtle loading indicator

// This page acts as a redirect from the old /dashboard route to the new /dashboard/projects list.
// It ensures that the "Projects" list is the default entry point for the dashboard section.

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the projects list page as soon as this component mounts
    router.replace('/dashboard/projects');
  }, [router]); // Dependency array to ensure effect runs only once

  // While redirecting, show a minimal loading message.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p>Redirecting to your projects...</p>
    </div>
  );
}