'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { useTheme } from 'next-themes';
import { useEffect, useState } from "react";
import Image from 'next/image';

export default function HomePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render nothing or a neutral placeholder until theme is known
    return <Image 
    src="/slight.png" 
    alt="Gitstack Logo"
    width={32}
    height={32}
    className="h-8 w-auto"
    priority
    />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header/Navbar */}
      <header className="flex items-center justify-between p-4 border-none">
      
        <div className="flex items-center space-x-2" suppressHydrationWarning>
        {resolvedTheme === 'dark' ? (
        <Image 
          src="/sdark.png" 
          alt="Gitstack Logo Dark" 
          width={32}
          height={32}
          className="h-8 w-auto"
          priority
          />
    ) : (
        <Image 
        src="/slight.png" 
        alt="Gitstack Logo Light" 
        width={32}
        height={32}
        className="h-8 w-auto"
        priority
        />
    )}
          <span className="text-xl font-black">Gitstack</span>
        </div>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" /> 
          </SignedIn>
          
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-8">

        {/* Description */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Version <p className='italic'>Everything.</p>
        </h1>
        <p className="max-w-3xl text-lg md:text-xl text-muted-foreground">
          Extends the philosophy of Git more than code. <br />For developers, researchers, and teams everywhere.
        </p>

        {/* Action Buttons (for direct web sign-up/in if not using CLI flow) */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <SignedOut>
            <SignUpButton mode="modal">
              <Button className='rounded-full cursor-pointer' size="lg">Sign Up</Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="outline" className='rounded-full cursor-pointer' size={'lg'}>Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" passHref>
              <Button size="lg" className='rounded-full cursor-pointer'>Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Gitstack. All rights reserved.
      </footer>
    </div>
  );
}