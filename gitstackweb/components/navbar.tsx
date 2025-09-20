// gitstackweb/components/navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"; // Assuming you have next-themes installed for dark mode
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
    const { resolvedTheme } = useTheme(); // Get current theme and setTheme

  
  const logoSrc = resolvedTheme === "dark" ? "/logolight.png" : "/logodark.png";

  return (
    <nav className="border-b p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={logoSrc} alt="Gitstack Logo" width={24} height={24} />
          <span className="text-xl font-bold">Gitstack</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="https://github.com/bolaabanjo/gitstack" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="cursor-pointer">GitHub</Button>
          </Link>
          <Link href="/signup">
            <Button className="cursor-pointer">Get Started</Button>
          </Link>
          {/* Dark mode toggle button */}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}