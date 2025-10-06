"use client";

import { Suspense, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createOrGetUser } from "@/lib/api";
import { saveClerkSessionLocally } from "@/utils/auth";

function AuthSuccessContent() {
  const { isLoaded, isSignedIn, sessionId, getToken, userId: clerkAuthUserId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function run() {
      if (!isLoaded) return;

      if (!isSignedIn || !sessionId || !user || !clerkAuthUserId) {
        router.push("/login");
        return;
      }

      try {
        const token = await getToken().catch(() => null);
        const primaryEmail = user.emailAddresses?.[0]?.emailAddress;
        if (!primaryEmail) throw new Error("No primary email on Clerk user");

        const { userId: pgUserId } = await createOrGetUser({
          clerkUserId: clerkAuthUserId,
          email: primaryEmail,
          name: user.fullName || user.username || undefined,
        });

        if (token) {
          saveClerkSessionLocally(token, pgUserId, clerkAuthUserId);
        }

        router.push("/dashboard");
      } catch (err) {
        console.error("Auth success flow failed:", err);
        router.push("/");
      }
    }

    run();
  }, [isLoaded, isSignedIn, sessionId, user, clerkAuthUserId, getToken, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
      <p>Completing sign-in…</p>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
          <p>Loading…</p>
        </div>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}