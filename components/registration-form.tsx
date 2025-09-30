"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, Suspense } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

function RegistrationFormContent({ className, ...props }: React.ComponentProps<"div">) {
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
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get("redirect_uri");
  const cliAuthToken = searchParams.get("cli_auth_token");
  const cliMode = Boolean(redirectUri && cliAuthToken);

  // === Handle Email Registration ===
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
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        if (cliMode) {
          const callbackUrl = `${redirectUri}?clerk_user_id=${result.createdUserId}&clerk_session_token=${result.createdSessionId}&cli_auth_token=${cliAuthToken}`;
          window.location.href = callbackUrl;
        } else {
          router.push("/dashboard");
        }
      } else if (result.status === "missing_requirements") {
        setVerificationRequired(true);
        setError("Check your email for a verification code.");
      } else {
        setError("Check your email for a verification link.");
      }
    } catch (err: unknown) {
      const maybeErr = err as { errors?: { message?: string }[] };
      setError(maybeErr?.errors?.[0]?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // === Handle Verification Code ===
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
    } catch (err: unknown) {
      const maybeErr = err as { errors?: { message?: string }[] };
      setError(maybeErr?.errors?.[0]?.message || "Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  // === Handle Google & GitHub SSO ===
  async function handleSSO(strategy: "oauth_google" | "oauth_github") {
    if (!isLoaded) return;
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: `${origin}/auth-success?redirect_uri=${encodeURIComponent(redirectUri || "")}&cli_auth_token=${cliAuthToken || ""}`,
        redirectUrlComplete: cliMode
          ? `${redirectUri}?cli_auth_token=${cliAuthToken}`
          : `${origin}/dashboard`,
      });
    } catch {
      setError("SSO failed. Please try again.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {!verificationRequired ? (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Logo + Header */}
            <div className="flex flex-col items-center gap-2">
              <Image
                src={resolvedTheme === "dark" ? "/sdark.png" : "/slight.png"}
                alt="Gitstack Logo"
                width={32}
                height={32}
                priority
              />
              <h1 className="text-xl font-bold">Create your Gitstack account</h1>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Email + Password Inputs */}
            <div className="flex flex-col gap-3 mt-6">
              <Input
                className="h-14 rounded-full"
                id="email"
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Input
                className="h-14 rounded-full"
                id="password"
                type="password"
                placeholder="Your password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Input
                className="h-14 rounded-full"
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />

              {error && <div className="text-red-500 text-sm text-center">{error}</div>}

              <Button type="submit" className="w-full h-12 rounded-full" disabled={loading}>
                {loading ? "Registering..." : "Sign Up"}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">Or</span>
            </div>

            {/* SSO Buttons */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" type="button" className="h-12 rounded-full" onClick={() => handleSSO("oauth_google")}>
                Google
              </Button>
              <Button variant="outline" type="button" className="h-12 rounded-full" onClick={() => handleSSO("oauth_github")}>
                GitHub
              </Button>
            </div>
          </div>
        </form>
      ) : (
        // === Email Verification Form ===
        <form onSubmit={handleVerification}>
          <div className="flex flex-col gap-6 items-center">
            <h1 className="text-xl font-bold">Verify your email</h1>
            <div className="text-center text-sm max-w-xs">
              We sent a verification code to <span className="font-semibold">{email}</span>.<br />
              Enter it below to complete registration.
            </div>
            <Input
              className="h-14 rounded-full max-w-xs"
              id="verificationCode"
              type="text"
              placeholder="Verification code"
              required
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="h-12 rounded-full max-w-xs" disabled={verifying}>
              {verifying ? "Verifying..." : "Verify Email"}
            </Button>
          </div>
        </form>
      )}

      {/* Terms + Privacy */}
      <div className="text-muted-foreground text-center text-xs mt-4">
        By continuing, you agree to our{" "}
        <a href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
      </div>
    </div>
  );
}

export function RegistrationForm(props: React.ComponentProps<"div">) {
  return (
    <Suspense fallback={<div>Loading registration form...</div>}>
      <RegistrationFormContent {...props} />
    </Suspense>
  );
}
