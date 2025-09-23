// app/auth-success/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useQuery } from 'convex/react'; // Import useQuery from Convex
import { api } from '../../convex/_generated/api'; // Assuming your Convex API is here

export default function AuthSuccessPage() {
  const { isLoaded, isSignedIn, sessionId, getToken, userId: clerkAuthUserId } = useAuth(); // Renamed userId to clerkAuthUserId to avoid conflict
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams(); // Get URL search parameters

  useEffect(() => {
    async function handleAuthSuccessRedirect() {
      if (isLoaded && isSignedIn && sessionId && user && clerkAuthUserId) {
        // 1. Get the redirect_uri that the CLI provided
        const redirectUri = searchParams.get('redirect_uri');

        if (!redirectUri) {
          console.error("Missing redirect_uri in URL. Cannot complete CLI authentication.");
          // Optionally, redirect to a standard web app dashboard or show an error
          router.push('/');
          return;
        }

        const clerkSessionToken = await getToken(); // Get the JWT token
        const clerkUserId = clerkAuthUserId; // Use the userId from useAuth

        if (!clerkSessionToken || !clerkUserId) {
          console.error("Clerk session token or user ID not found.");
          router.push('/sign-in');
          return;
        }

        // 2. Query Convex to get the Convex user ID associated with the Clerk user ID
        // Note: This needs to be done within a valid Convex React context.
        // I'll simulate the query here for now, but in a full Convex setup,
        // I'd call a query function. For a quick fix to avoid issues,
        // we'll fetch the user data in a client-side friendly way that you'll implement next.
        // For now, we'll use a placeholder for `convexUserId`

        // **** IMPORTANT: We need to fetch the Convex user ID. ****
        // This is a crucial part. The `useQuery` hook needs to be
        // at the top level of the component or within a component
        // that is wrapped by the Convex React Provider.
        // Since this is a client component, we can use useQuery directly.

        // Placeholder for now, we'll refine this in the next step.
        // This query needs to run in a way that doesn't block the redirect.

        // For now, let's assume we can directly query the Clerk ID from the Convex functions,
        // but remember, this `useQuery` call below is what actually gets the data.
        // We will make sure this query is enabled only when `clerkUserId` is available.
        // This will be resolved when we look at the Convex part of the setup.
        
        // For now, let's defer the actual Convex fetching to the client side
        // to avoid re-rendering issues with `useQuery` inside useEffect initially.
        // We'll make a separate section for Convex integration.
        
        // For the IMMEDIATE fix to unblock, let's assume we can get a convex_user_id
        // via a direct mutation/query from the client, which is what we need to set up.
        // For the purpose of getting the CLI working, we need the convex_user_id to be
        // available in this `redirect_url` to the CLI.

        // For the immediate purpose, let's just make sure the `redirectUri` works.
        // We need a way to get the convexUserId from the web app.

        // We will need to make an *API call* from the web app to its own backend (e.g., /api/get-convex-user-id)
        // or a Convex mutation from the client to link Clerk ID with Convex ID if it doesn't exist.

        // This `AuthSuccessPage` is a client component. We can use `useQuery` here.
        // Let's refine the approach:
        // 1. Check if user exists in Convex.
        // 2. If not, create user in Convex and get its ID.
        // 3. Then proceed with the redirect.

        let convexUserId = null;
        try {
          // This call must be a mutation if the user might not exist, or a query for existing users.
          // Let's assume a client-side mutation that creates or retrieves.
          const convexUser = await fetch('/api/getConvexUserId', { // Create this API route
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ clerkUserId, clerkSessionToken }),
          }).then(res => res.json());

          if (convexUser && convexUser.convexUserId) {
            convexUserId = convexUser.convexUserId;
          } else {
            console.error("Failed to get Convex User ID from web app API.");
            router.push('/');
            return;
          }

        } catch (error) {
          console.error("Error fetching Convex user ID in auth-success:", error);
          router.push('/');
          return;
        }

        // 3. Construct the callback URL for the CLI
        const finalRedirectUrl = new URL(redirectUri);
        finalRedirectUrl.searchParams.set('clerk_session_token', clerkSessionToken);
        finalRedirectUrl.searchParams.set('clerk_user_id', clerkUserId);
        finalRedirectUrl.searchParams.set('convex_user_id', convexUserId); // Add the Convex user ID

        // 4. Redirect the browser back to the CLI's local server
        window.location.href = finalRedirectUrl.toString();

      } else if (isLoaded && !isSignedIn) {
        // If loaded but not signed in, redirect to sign-in page
        router.push('/sign-in');
      }
    }

    // Only run if Clerk is loaded and user is signed in, and we haven't redirected yet
    if (isLoaded && isSignedIn && !window.location.search.includes('clerk_session_token')) {
        handleAuthSuccessRedirect();
    }
  }, [isLoaded, isSignedIn, sessionId, user, clerkAuthUserId, getToken, router, searchParams]);


  if (!isLoaded || !isSignedIn) {
    return <div>Loading authentication status...</div>;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Completing authentication...</h1>
      <p>Please wait while we redirect you back to the terminal.</p>
    </div>
  );
}
