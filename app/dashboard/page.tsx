'use client';

import { Suspense, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function DashboardContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
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

  if (!isLoaded) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading dashboard...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        You must be signed in to view the dashboard.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Gitstack Dashboard</h1>
      {user && <p>Welcome, {user.emailAddresses[0]?.emailAddress || user.id}!</p>}
      <p>This is your personalized Gitstack dashboard.</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
