"use client";

import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";

export default function LoginPage() {

  return (
    <div className="relative bg-background min-h-svh flex flex-col items-center justify-center p-6 md:p-10">
      {/* Mode toggle at top right */}
      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>
      {/* Login form */}
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}