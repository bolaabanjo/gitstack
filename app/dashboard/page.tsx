// app/dashboard/page.tsx

"use client";

import { Suspense, useEffect } from "react";
import { useUser, UserProfile } from '@clerk/nextjs'; // Import UserProfile component
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image'; // Import Image component for optimized avatars
import Link from 'next/link'; // For the "Manage Account" link
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

function DashboardContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This toast confirms web session activation and guides to CLI if applicable.
    // It's still relevant here after the auth-success page redirects.
    if (searchParams.get('auth_success') === 'true') {
      toast("Welcome back to Gitstack!", {
        description: "Your web session is active. Please return to your terminal to continue with Gitstack CLI.",
        duration: 8000,
      });

      // Clean up the URL param to prevent the toast from reappearing on refresh
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('auth_success');
      const newUrl = `${window.location.pathname}${
        newSearchParams.toString() ? '?' + newSearchParams.toString() : ''
      }`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center text-red-500">
        You must be signed in to view the dashboard.
        <Link href="/login" className="ml-2 underline hover:text-red-400">Login here</Link>
      </div>
    );
  }

  // Display user's primary email address
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'N/A';
  // Display user's full name, or fallback to email if not available
  const userName = user?.fullName || userEmail;
  // User's profile image URL
  const userImageUrl = user?.imageUrl;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <h1 className="text-4xl font-extrabold mb-8">Gitstack Dashboard</h1>

      {user && (
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full mb-12">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Your Profile</h2>
          <div className="flex items-center space-x-4 mb-4">
            {userImageUrl && (
              <Image
                src={userImageUrl}
                alt={`${userName}'s profile picture`}
                width={64}
                height={64}
                className="rounded-full border-2 border-primary"
                priority // Preload the image
              />
            )}
            <div>
              <p className="text-lg font-medium">{userName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">
            This is your personalized Gitstack dashboard. Manage your settings below.
          </p>
          <Link href="/user" passHref> {/* Link to Clerk's user profile management page */}
            <Button className="w-full rounded-full">Manage Account</Button>
          </Link>
        </div>
      )}

      {/* Placeholder for other dashboard content */}
      <div className="text-center text-muted-foreground">
        <p>More dashboard features coming soon!</p>
        <p className="mt-2">Start using `gitstack snap` in your terminal to manage your projects.</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen p-4 text-center text-muted-foreground">
            Loading dashboard...
        </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}