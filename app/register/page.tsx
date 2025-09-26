"use client";

import { RegistrationForm } from "@/components/registration-form";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function RegistrationPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

 useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <div className="relative bg-background min-h-svh flex flex-col items-center justify-center p-6 md:p-10">
      {/* Mode toggle at top right */}
      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>
      {/* Registration form */}
      <div className="w-full max-w-sm">
        <RegistrationForm />
      </div>
    </div>
  );
}