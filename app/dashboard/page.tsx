// app/dashboard/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you have a Shadcn Button component

// --- Placeholder Components for Dashboard Sections ---
// We will create these components in later steps.
function OverviewComponentPlaceholder() {
  return (
    <section className="mb-8 p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Overview Component Placeholder</h2>
      <p className="text-muted-foreground">This section will display key metrics and summaries.</p>
      {/* Example content from UI spec:
        - Snapshots, Deployments, Active Users (metric cards)
        - Latest Snapshot, Last Deployment, AI Insight (preview cards)
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 border rounded-md">Metric Card 1</div>
        <div className="p-4 border rounded-md">Metric Card 2</div>
        <div className="p-4 border rounded-md">Metric Card 3</div>
      </div>
    </section>
  );
}

function ActivityFeedComponentPlaceholder() {
  return (
    <section className="mb-8 p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Activity Feed Placeholder</h2>
      <p className="text-muted-foreground">This section will show recent activities and events.</p>
      {/* Example content from UI spec:
        - List of activity items (snapshot created, deploy started, AI explain)
      */}
      <ul className="mt-4 space-y-2">
        <li className="p-2 border rounded-md">Activity 1: Snapshot created by Bola</li>
        <li className="p-2 border rounded-md">Activity 2: Deploy to staging started</li>
      </ul>
    </section>
  );
}

function SnapshotTimelineComponentPlaceholder() {
  return (
    <section className="p-6 rounded-lg border bg-card text-card-foreground">
      <h2 className="text-2xl font-semibold mb-4">Snapshot Timeline Placeholder</h2>
      <p className="text-muted-foreground">This section will visualize project snapshots over time.</p>
      {/* Example content: A visual timeline or list of recent snapshots */}
      <div className="mt-4 h-32 bg-muted rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">Timeline visualization will go here</p>
      </div>
    </section>
  );
}
// --- End Placeholder Components ---


function DashboardPageContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This logic handles the specific CLI auth success message.
    // This toast should ideally be triggered by the cli-auth-success page itself
    // or a global state, but it's kept here for now as per previous implementation.
    // If 'auth_success' is intended for web auth success, the message needs adjusting.
    if (searchParams.get('auth_success') === 'true') {
      toast("Welcome back to Gitstack!", {
        description: "Your web session is active. You may now navigate the dashboard.",
        duration: 8000,
      });

      // Clean up the URL param
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('auth_success');
      const newUrl = `${window.location.pathname}${
        newSearchParams.toString() ? '?' + newSearchParams.toString() : ''
      }`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // --- Loading State ---
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // --- Not Signed In State ---
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You must be signed in to view the dashboard.</p>
        <Link href="/login" passHref>
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  // --- Signed In State: Render Dashboard Content ---
  // The header, sidebar, and footer are handled by app/dashboard/layout.tsx
  // This component focuses solely on the main content within the dashboard layout.
  return (
    <div className="space-y-8"> {/* Overall spacing for sections */}
      <h1 className="text-4xl font-extrabold tracking-tight">
        Dashboard <span className="text-primary">Overview</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl">
        Hello, {user?.fullName || user?.emailAddresses[0]?.emailAddress || "Gitstack User"}!
        Here&apos;s a quick summary of your project&apos;s health and recent activity.
      </p>

      {/* Render the placeholder components for each section */}
      <OverviewComponentPlaceholder />
      <ActivityFeedComponentPlaceholder />
      <SnapshotTimelineComponentPlaceholder />
    </div>
  );
}

// Wrap the content component in Suspense for potential async operations within.
export default function DashboardPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}