"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export function RegistrationForm({ className, ...props }: React.ComponentProps<"div">) {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!isLoaded || !signUp || !setActive) {
      setError("Auth system not loaded. Please try again.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else if (result.status === "missing_requirements") {
        setVerificationRequired(true);
        setError("Check your email for a verification code and enter it below.");
      } else {
        setError("Check your email for a verification link.");
      }
    } catch (err: unknown) {
      const maybeErr = err as { errors?: unknown } | null;
      if (
        maybeErr &&
        typeof maybeErr === "object" &&
        Array.isArray(maybeErr.errors)
      ) {
        const first = (maybeErr.errors as { message?: string }[])[0];
        setError(first?.message || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
    setLoading(false);
  }

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    if (!signUp || !setActive) {
      setError("Auth system not loaded. Please try again.");
      setVerifying(false);
      return;
    }
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Verification failed. Please try again.");
    }
    setVerifying(false);
  }

  async function handleSSO(strategy: "oauth_google" | "oauth_github") {
    if (!isLoaded) return;
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: `${origin}/auth/callback`,
        redirectUrlComplete: `${origin}/`,
      });
    } catch (err: unknown) {
      setError("SSO failed. Please try again.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {!verificationRequired ? (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              {/* Theme-based logo */}
              {resolvedTheme === "dark" ? (
                <Image
                  src="/sdark.png"
                  alt="Gitstack Logo Dark"
                  width={32}
                  height={32}
                  priority
                />
              ) : (
                <Image
                  src="/slight.png"
                  alt="Gitstack Logo Light"
                  width={32}
                  height={32}
                  priority
                />
              )}
              <h1 className="text-xl font-bold">Create your Gitstack account</h1>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <div className="grid gap-3">
                <Input
                  className="h-14 cursor-pointer rounded-full"
                  id="email"
                  type="email"
                  placeholder="   Email Address"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Input
                  className="h-14 cursor-pointer rounded-full"
                  id="password"
                  type="password"
                  placeholder="   Your password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Input
                  className="h-14 cursor-pointer rounded-full"
                  id="confirmPassword"
                  type="password"
                  placeholder="   Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              <div id="clerk-captcha" />
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Button type="submit" className="w-full h-12 cursor-pointer rounded-full" disabled={loading}>
                {loading ? "Registering..." : "Sign Up"}
              </Button>
            </div>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                variant="outline"
                type="button"
                className="w-full h-12 cursor-pointer rounded-full"
                onClick={() => handleSSO("oauth_google")}
              >
                {/* Google logo SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
                  <path
                    d="M21.35 11.1h-9.18v2.98h5.26c-.23 1.24-1.39 3.64-5.26 3.64-3.16 0-5.74-2.62-5.74-5.85s2.58-5.85 5.74-5.85c1.8 0 3.01.77 3.7 1.43l2.53-2.46C16.41 3.54 14.13 2.5 11.35 2.5 6.36 2.5 2.5 6.36 2.5 11.35s3.86 8.85 8.85 8.85c5.09 0 8.45-3.57 8.45-8.6 0-.57-.06-1.13-.15-1.65z"
                    fill="currentColor"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full h-12 cursor-pointer rounded-full"
                onClick={() => handleSSO("oauth_github")}
              >
                {/* GitHub logo SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
                  <path
                    d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.525.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.646.349-1.088.635-1.34-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.099 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"
                    fill="currentColor"
                  />
                </svg>
                GitHub
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerification}>
          <div className="flex flex-col gap-6 items-center">
            <h1 className="text-xl font-bold">Verify your email</h1>
            <div className="text-center text-sm max-w-xs">
              We sent a verification code to <span className="font-semibold">{email}</span>.<br />
              Please enter the code from your email to complete registration.
            </div>
            <Input
              className="h-14 cursor-pointer rounded-full max-w-xs"
              id="verificationCode"
              type="text"
              placeholder="Verification code"
              required
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
            />
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full h-12 cursor-pointer rounded-full max-w-xs" disabled={verifying}>
              {verifying ? "Verifying..." : "Verify Email"}
            </Button>
          </div>
        </form>
      )}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 mt-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}