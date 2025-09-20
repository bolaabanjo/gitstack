import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar"; // Import your Navbar component
import { ThemeProvider } from "@/components/theme-provider"; // Assuming you'll create this
import { ClerkProvider } from "@clerk/nextjs"; // Import ClerkProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gitstack",
  description: "Modern Version Control for Your Stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider> {/* Wrap the entire application with ClerkProvider */}
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar /> {/* Integrate the Navbar component here */}
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
