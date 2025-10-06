// app/layout.tsx
import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
// REMOVED: import ConvexClientProvider from '@/components/convex-client-provider'
// NEW: Import QueryClient and QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// NEW: Create a QueryClient instance outside the component
const queryClient = new QueryClient();

export const metadata: Metadata = {
  title: 'Gitstack',
  description: 'An advanced version control system that versions everything.',
  icons: {
    icon: '/fav.png',
    shortcut: '/fav.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    signInUrl="/login"
    signUpUrl="/register"
    afterSignInUrl="/dashboard"
    afterSignUpUrl="/dashboard"
    >
      {/* REMOVED: <ConvexClientProvider> */}
        <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}      >
            {/* NEW: Wrap ThemeProvider with QueryClientProvider */}
            <QueryClientProvider client={queryClient}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster />
              </ThemeProvider>
            </QueryClientProvider> {/* NEW: Closing QueryClientProvider */}
          </body>
        </html>
      {/* REMOVED: </ConvexClientProvider> */}
    </ClerkProvider>
  )
}