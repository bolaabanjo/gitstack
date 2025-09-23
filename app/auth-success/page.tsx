'use client';

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { saveClerkSessionLocally } from "../../utils/auth";

export default function AuthSuccessPaage() {
    const { isLoaded, isSignedIn, sessionId, getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        async function handleAuthSucces() {
            if (isLoaded && isSignedIn && sessionId && user) {
                const token = await getToken();
                const clerkUserId = user.id;

                console.log("Authentication successful on web app");
                console.log("Clerk Session ID:", sessionId);
                console.log("Clerk User ID:", clerkUserId);
                console.log("JWT Token (for demonstration):", token);

            }else if (isLoaded && !isSignedIn) {
                router.push('/sign-in')
            }
        }
      handleAuthSucces();  
    }, [isLoaded, isSignedIn, sessionId, user, getToken, router]);

    if (!isLoaded) {
        return <div>Loading auth status...</div>;
    }

    if (isSignedIn) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Authentication Successful</h1>
                <p>You can return to your terminal</p>
                <p>Your session is active in the web application</p>
                {user && <p>Welcome, {user.emailAddresses[0]?.emailAddress || user.id}</p>}
            </div>
        );
    }

    return null;
}