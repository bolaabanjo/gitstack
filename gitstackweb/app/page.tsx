// gitstackweb/app/page.tsx
import Image from "next/image";
import Link from "next/link"; // Import Link
// Import Shadcn UI components you've installed, e.g.:
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
// import { Input } from "@/components/ui/input"; // if you need input fields

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header (Optional - often in layout.tsx or a dedicated component) */}
      {/* For now, we'll focus on the main content */}

      <main className="flex-grow">
        {/* 1. Hero Section */}
        <section className="container mx-auto py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Gitstack: Modern Version Control for <span className="text-primary">Your Stack</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Capture, manage, and collaborate on your codebase, dependencies, and environment with ease.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Button variant="outline" size="lg">View Repo</Button>
          </div>
          {/* Optional: Image/Illustration */}
          {/* <div className="mt-12">
            <Image
              src="/placeholder-hero-image.png" // Replace with your image path
              alt="Gitstack in action"
              width={800}
              height={450}
              className="mx-auto rounded-lg shadow-xl"
            />
          </div> */}
        </section>

      
        
      </main>

      {/* 5. Footer */}
      <footer className="text-black py-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Gitstack. All rights reserved.</p>
          {/* Optional: Footer navigation links */}
          {/* <div className="mt-4 space-x-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div> */}
        </div>
      </footer>
    </div>
  );
}