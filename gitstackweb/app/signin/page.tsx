// gitstackweb/app/signin/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12"> {/* Adjust height for navbar */}
      <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/signup" /> {/* Redirect after sign-in */}
    </div>
  );
}