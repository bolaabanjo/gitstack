// app/auth-success/page.tsx

"use client";

import { Suspense, useEffect } from "react";
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation'; // Removed useSearchParams as it's not needed here

// This page handles successful web authentication (login/signup) and
// ensures the user has a corresponding record in Convex, then redirects to the dashboard.
// All CLI-specific authentication logic has been moved to app/cli-auth-success/page.tsx.

function AuthSuccessContent() {
  const { isLoaded, isSignedIn, sessionId, getToken, userId: clerkAuthUserId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function handleWebAuthSuccess() {
      // 1. Ensure Clerk user data is loaded and the user is signed in.
      if (!isLoaded || !isSignedIn || !sessionId || !user || !clerkAuthUserId) {
        // If not signed in or data not loaded, redirect to login.
        // This acts as a safeguard; Clerk's configuration in layout.tsx should
        // ideally handle redirects for unauthenticated users directly.
        if (isLoaded && !isSignedIn) {
          router.push('/login');
        }
        return;
      }

      // 2. Obtain Clerk session token.
      const clerkSessionToken = await getToken();
      if (!clerkSessionToken) {
        console.error("Clerk session token not available after successful authentication.");
        router.push('/login'); // Should not happen, but as a safeguard
        return;
      }

      // 3. Ensure the user has a corresponding Convex user ID.
      // This is a crucial step to link Clerk users to our Convex backend.
      // We'll call an API route (e.g., `/api/getConvexUserId`) that
      // either retrieves the existing Convex user ID or creates a new one
      // based on the Clerk user ID.
      try {
        const convexUserResponse = await fetch('/api/getConvexUserId', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkUserId: clerkAuthUserId,
            clerkSessionToken: clerkSessionToken,
          }),
        });

        if (!convexUserResponse.ok) {
          console.error("Failed to get/create Convex user ID:", convexUserResponse.statusText);
          router.push('/'); // Redirect to home or an error page if Convex user linking fails
          return;
        }

        const convexUser = await convexUserResponse.json();
        if (!convexUser || !convexUser.convexUserId) {
          console.error("Convex user ID not returned by API.");
          router.push('/'); // Redirect if response is invalid
          return;
        }

        // At this point, the web authentication is complete,
        // and the user's Clerk ID is linked to a Convex user ID.
        // We can now safely redirect them to the dashboard.
        router.push('/dashboard');

      } catch (error) {
        console.error("Error during Convex user ID linking:", error);
        router.push('/'); // Redirect to home or an error page on API call failure
      }
    }

    // Only run this effect if Clerk data is loaded and the user is signed in.
    // The `sessionId` and `user` checks provide further assurance.
    if (isLoaded && isSignedIn && sessionId && user && clerkAuthUserId) {
        handleWebAuthSuccess();
    } else if (isLoaded && !isSignedIn) {
        // If Clerk is loaded but user is not signed in, redirect to login.
        router.push('/login');
    }

  }, [isLoaded, isSignedIn, sessionId, user, clerkAuthUserId, getToken, router]); // Dependency array

  // --- Render content while processing ---
  // A simple loading message or a null value is sufficient as this page's
  // sole purpose is to process and redirect.
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  // If signed in, we are processing and will redirect soon.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
      <h1 className="text-2xl font-bold">Authentication Successful!</h1>
      <p>Redirecting you to the dashboard...</p>
    </div>
  );
}

// Wrap the content component in Suspense for potential async operations within.
export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
            <p>Loading...</p>
        </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  );
}