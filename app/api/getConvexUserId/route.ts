import { NextResponse } from 'next/server';

// Make sure these are set in your .env file
const CONVEX_URL = process.env.CONVEX_URL; // e.g. https://your-deployment.convex.cloud
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { clerkUserId } = await request.json();

    if (!CONVEX_URL || !CLERK_SECRET_KEY) {
      return NextResponse.json({ error: "Missing Convex URL or Clerk Secret Key environment variables." }, { status: 500 });
    }

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Clerk User ID is required.' }, { status: 400 });
    }

    // 1. Try to get the user from Convex
    const getUserBody = {
      path: "users:createOrGetUser", // Use your mutation from convex/users.ts
      args: { clerkUserId },         // Only clerkUserId for lookup
      format: "json"
    };

    let response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLERK_SECRET_KEY}`
      },
      body: JSON.stringify(getUserBody)
    });

    let result = await response.json();

    if (result.status === "success") {
      // User exists or was created, return their Convex _id
      return NextResponse.json({ convexUserId: result.value });
    }

    // 2. If not found, fetch user details from Clerk and create in Convex
    const clerkUserResponse = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const clerkUserData = await clerkUserResponse.json();
    const userEmail = clerkUserData.email_addresses?.[0]?.email_address;
    const userName = clerkUserData.first_name || "";

    if (!userEmail) {
      return NextResponse.json({ error: 'Could not retrieve user email from Clerk.' }, { status: 500 });
    }

    // Create user in Convex
    const createUserBody = {
      path: "users:createOrGetUser",
      args: {
        clerkUserId,
        email: userEmail,
        name: userName
      },
      format: "json"
    };

    response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CLERK_SECRET_KEY}`
      },
      body: JSON.stringify(createUserBody)
    });

    result = await response.json();

    if (result.status === "success") {
      return NextResponse.json({ convexUserId: result.value });
    } else {
      return NextResponse.json({ error: result.errorMessage || "Convex user creation failed." }, { status: 500 });
    }

  } catch (error) {
    console.error("API Error in /api/getConvexUserId:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}