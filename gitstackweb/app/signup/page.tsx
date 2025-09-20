// gitstackweb/app/signup/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12"> {/* Adjust height for navbar */}
      <SignUp afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" /> {/* Redirect after sign-up/in */}
    </div>
  );
}