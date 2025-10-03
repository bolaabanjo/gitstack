// app/dashboard/page.tsx

"use client";

import { Suspense, useEffect } from "react";
import { useUser, UserButton } from '@clerk/nextjs'; // Added UserButton for a full profile experience
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Shadcn Avatar component
import { Button } from "@/components/ui/button"; // Assuming you have a Shadcn Button component
import Link from "next/link"; // For navigation buttons

function DashboardContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This logic handles the specific CLI auth success message.
    // We'll keep it here for now, but remember the dedicated cli-auth-success page.
    // If the web flow also passes 'auth_success', this would trigger.
    if (searchParams.get('auth_success') === 'true') {
      toast("Welcome back to Gitstack!", {
        description: "Your web session is active. Please return to your terminal to continue with Gitstack CLI.",
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

  // --- Signed In State: Render Dashboard ---
  const userDisplayName = user?.fullName || user?.emailAddresses[0]?.emailAddress || "Gitstack User";
  const userAvatarUrl = user?.imageUrl;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header/Navbar */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/" className="text-xl font-black text-primary hover:opacity-80 transition-opacity">
          Gitstack
        </Link>
        <div className="flex items-center space-x-4">
          {/* Shadcn Profile Avatar */}
          {user && (
            <Avatar className="h-9 w-9">
              <AvatarImage src={userAvatarUrl} alt={userDisplayName} />
              <AvatarFallback>{userDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          {/* Clerk User Button for full profile management */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Welcome to your <span className="text-primary">Dashboard</span>
        </h1>
        {user && (
          <p className="max-w-3xl text-lg md:text-xl text-muted-foreground">
            Hello, {userDisplayName}! This is your personalized Gitstack dashboard.
            Here you will find all your project snapshots, deployments, and analytics.
          </p>
        )}
        {/* Placeholder for future content */}
        <div className="mt-8 p-6 border rounded-lg shadow-sm w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
          <p className="text-muted-foreground">No projects found yet. Start by connecting your first repository!</p>
          <Button className="mt-6">Create New Project</Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        &copy; {new Date().getFullYear()} Gitstack. All rights reserved.{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>
        {" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms
        </Link>
      </footer>
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
      <DashboardContent />
    </Suspense>
  );
}