'use client';

import { Suspense } from "react";
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const CONVEX_URL = process.env.CONVEX_SITE_URL;
if (!CONVEX_URL) throw new Error("CONVEX_SITE_URL is not defined");

const convexClient = new ConvexHttpClient(CONVEX_URL);

function AuthSuccessContent() {
  const { isLoaded, isSignedIn, sessionId, getToken, userId: clerkAuthUserId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleAuthSuccess() {
      if (isLoaded && isSignedIn && sessionId && user && clerkAuthUserId) {
        const redirectUri = searchParams.get('redirect_uri');
        if (!redirectUri) {
          router.push('/');
          return;
        }

        const clerkSessionToken = await getToken();
        const clerkUserId = clerkAuthUserId;
        if (!clerkSessionToken || !clerkUserId) {
          router.push('/sign-in');
          return;
        }

        let convexUserId: Id<"users"> | undefined;
        try {
          const convexUserResponse = await fetch('/api/getConvexUserId', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clerkUserId, clerkSessionToken }),
          });
          if (!convexUserResponse.ok) {
            router.push('/');
            return;
          }
          const convexUser = await convexUserResponse.json();
          if (convexUser && convexUser.convexUserId) {
            convexUserId = convexUser.convexUserId;
          } else {
            router.push('/');
            return;
          }
        } catch {
          router.push('/');
          return;
        }

        const cliAuthToken = searchParams.get('cli_auth_token');
        if (!cliAuthToken || !convexUserId) {
          router.push('/');
          return;
        }

        try {
          await convexClient.mutation(api.cliAuth.completeAuthRequest, {
            cliAuthToken,
            clerkUserId,
            convexUserId,
            clerkSessionToken
          });
        } catch {
          router.push('/');
          return;
        }

        try {
          await fetch(redirectUri, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerk_session_token: clerkSessionToken,
              clerk_user_id: clerkUserId,
              convex_user_id: convexUserId,
            }),
          });
          router.push("/dashboard?auth_success=true");
        } catch {
          router.push("/");
        }
      } else if (isLoaded && !isSignedIn) {
        router.push('/sign-in');
      }
    }

    const hasRedirectUriParam = searchParams.has('redirect_uri');
    if (isLoaded && isSignedIn && hasRedirectUriParam) {
      handleAuthSuccess();
    } else if (isLoaded && isSignedIn && !hasRedirectUriParam) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, sessionId, user, clerkAuthUserId, getToken, router, searchParams]);

  if (!isLoaded || !isSignedIn) {
    return <div>Loading authentication status...</div>;
  }

  if (isSignedIn && searchParams.has('redirect_uri')) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Completing authentication...</h1>
        <p>Please wait while we set up your session in the terminal.</p>
      </div>
    );
  }

  return null;
}

export default function AuthSuccessPage() {
  return (
    <Suspense>
      <AuthSuccessContent />
    </Suspense>
  );
}