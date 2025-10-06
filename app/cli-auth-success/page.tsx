// app/cli-auth-success/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createOrGetUser,
  completeCliAuthRequest,
} from '@/lib/api'; // Import the new API functions
import { toast } from 'sonner';

function CliAuthSuccessContent() {
  const { isLoaded, isSignedIn, sessionId, getToken, userId: clerkAuthUserId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing CLI authentication...');

  useEffect(() => {
    async function handleCliAuthSuccess() {
      const redirectUri = searchParams.get('redirect_uri');
      const cliAuthToken = searchParams.get('cli_auth_token'); // Assuming CLI passes this

      if (!redirectUri || !cliAuthToken) {
        setStatus('error');
        setMessage('Missing redirect_uri or cli_auth_token in URL.');
        toast.error('CLI Auth Error', { description: 'Missing redirect_uri or cli_auth_token.' });
        return;
      }

      // Phase 1: Ensure Clerk user data is loaded and the user is signed in.
      if (!isLoaded || !isSignedIn || !sessionId || !user || !clerkAuthUserId) {
        if (isLoaded && !isSignedIn) {
          router.push(`/login?${searchParams.toString()}`);
        } else {
          setMessage('Waiting for user authentication...');
        }
        return;
      }

      try {
        // 2. Obtain Clerk session token.
        const clerkSessionToken = await getToken();
        if (!clerkSessionToken) {
          throw new Error("Clerk session token not available.");
        }

        // 3. Create or fetch our internal PostgreSQL user ID
        const userEmail = user.emailAddresses?.[0]?.emailAddress;
        if (!userEmail) {
          throw new Error("Clerk user email not found.");
        }

        const pgUserResponse = await createOrGetUser({
          clerkUserId: clerkAuthUserId,
          email: userEmail,
          name: user.fullName || user.username || undefined,
        });
        const pgUserId = pgUserResponse.userId; // Our internal PostgreSQL UUID

        if (!pgUserId) {
          throw new Error("PostgreSQL user ID not returned by API.");
        }

        // 4. Complete the CLI auth request on our backend
        await completeCliAuthRequest({
          cliAuthToken,
          clerkUserId: clerkAuthUserId,
          pgUserId,
          clerkSessionToken,
        });

        // 5. Post data back to the CLI's local server
        const cliCallbackResponse = await fetch(redirectUri, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerk_session_token: clerkSessionToken,
            clerk_user_id: clerkAuthUserId,
            convex_user_id: pgUserId, // CLI still expects 'convex_user_id' for now
          }),
        });

        if (!cliCallbackResponse.ok) {
          const errorText = await cliCallbackResponse.text();
          throw new Error(`CLI callback failed: ${cliCallbackResponse.status} - ${errorText}`);
        }

        setStatus('success');
        setMessage('Authentication successful! You can now return to your terminal.');
        toast.success('CLI Authentication', { description: 'You are now authenticated with Gitstack CLI!' });

      } catch (error) {
        console.error("Error during CLI authentication flow:", error); // Keep this for essential errors
        setStatus('error');
        setMessage(`Authentication failed: ${(error as Error).message}. Please try again from the CLI.`);
        toast.error('CLI Auth Failed', { description: (error as Error).message });
        router.push('/login'); // Redirect to login on error
      }
    }

    if (isLoaded && isSignedIn && sessionId && user && clerkAuthUserId) {
      handleCliAuthSuccess();
    } else if (isLoaded && !isSignedIn) {
      const currentPath = window.location.pathname;
      const currentSearchParams = window.location.search;
      if (!currentPath.startsWith('/login')) {
        router.push(`/login${currentSearchParams}`);
      }
    }

  }, [isLoaded, isSignedIn, sessionId, user, clerkAuthUserId, getToken, router, searchParams]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
      {status === 'loading' && (
        <>
          <h1 className="text-2xl font-bold">Processing CLI Authentication...</h1>
          <p>{message}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-2xl font-bold text-green-500">CLI Authentication Successful!</h1>
          <p>{message}</p>
          <p className="mt-4">You may now close this browser tab.</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="text-2xl font-bold text-red-500">CLI Authentication Failed</h1>
          <p>{message}</p>
          <p className="mt-4">Please return to your terminal and try logging in again.</p>
        </>
      )}
    </div>
  );
}

export default function CliAuthSuccessPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
            <p>Loading CLI authentication page...</p>
        </div>
    }>
      <CliAuthSuccessContent />
    </Suspense>
  );
}