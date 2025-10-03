// app/api/getConvexUserId/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/backend'; // ✅ correct import
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import type { Id } from '@/convex/_generated/dataModel';

// --- Convex client ---
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
const convexClient = new ConvexHttpClient(convexUrl);

// --- Clerk client ---
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) throw new Error('CLERK_SECRET_KEY is not set');
const clerk = createClerkClient({ secretKey: clerkSecretKey }); // ✅ this replaces `Clerk(...)`

export async function POST(req: NextRequest) {
  try {
    const { clerkUserId, clerkSessionToken } = await req.json();

    if (!clerkUserId || !clerkSessionToken) {
      return NextResponse.json(
        { error: 'Missing clerkUserId or clerkSessionToken' },
        { status: 400 }
      );
    }

    // 1. Verify session server-side
    let session;
    try {
      session = await clerk.sessions.verifySession(clerkUserId, clerkSessionToken);
    } catch (error) {
      console.error('Clerk session verification failed:', error);
      return NextResponse.json({ error: 'Invalid Clerk session token' }, { status: 401 });
    }

    if (session.userId !== clerkUserId) {
      return NextResponse.json({ error: 'Clerk user ID mismatch' }, { status: 403 });
    }

    // 2. Fetch user info
    const clerkUser = await clerk.users.getUser(clerkUserId);
    if (!clerkUser) {
      return NextResponse.json({ error: 'Clerk user not found' }, { status: 404 });
    }

    const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
    const userName =
      clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.username || userEmail;

    if (!userEmail) {
      return NextResponse.json({ error: 'Clerk user email not found' }, { status: 400 });
    }

    // 3. Create or fetch Convex user
    const convexUserId: Id<'users'> = await convexClient.mutation(
      api.users.createOrGetUser,
      {
        clerkUserId,
        email: userEmail,
        name: userName || undefined,
      }
    );

    return NextResponse.json({ convexUserId }, { status: 200 });
  } catch (error) {
    console.error('API /api/getConvexUserId error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
