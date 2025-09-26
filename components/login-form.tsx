"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resolvedTheme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!isLoaded) {
      setError("Auth system not loaded. Please try again.");
      setLoading(false);
      return;
    }
    try {
      const signInResult = await signIn.create({ identifier: email, password });
      if (signInResult.status === "complete") {
        await setActive({ session: signInResult.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Login incomplete. Please check your credentials or try again.");
      }
    } catch (err: unknown) {
  if (typeof err === "object" && err !== null && "errors" in err) {
    setError((err as { errors?: { message?: string }[] }).errors?.[0]?.message || "Login failed. Please try again.");
  } else {
    setError("Login failed. Please try again.");
  }
}
    setLoading(false);
  }

  async function handleSSO(strategy: "oauth_google" | "oauth_github") {
    if (!isLoaded) return;
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${origin}/`,
        redirectUrlComplete: `${origin}/`,
      });
    } catch (err: any) {
      setError("SSO failed. Please try again.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
            <h1 className="text-xl font-bold">Welcome to Gitstack</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 ">
            <div className="grid gap-3 ">
              
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
            <div className="grid gap-3 ">
              <Input
                className="h-14 cursor-pointer rounded-full"
                id="password"
                type="password"
                placeholder="   Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full h-12 cursor-pointer rounded-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
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
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}