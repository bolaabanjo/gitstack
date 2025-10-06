// app/dashboard/projects/new/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, createOrGetUser } from '@/lib/api'; // NEW: Import createOrGetUser
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import ProjectListTopbar from '@/components/project-list-topbar'; // NEW: Import topbar

// --- Form Schema Definition with Zod ---
const projectFormSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }).max(50, { message: "Project name cannot exceed 50 characters." }),
  description: z.string().max(200, { message: "Description cannot exceed 200 characters." }).optional(),
  visibility: z
  .enum(["public", "private"])
  .refine((val) => val, { message: "Project visibility is required." }),

});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// localStorage key for autosave
const AUTOSAVE_KEY = 'newProjectFormDraft';

export default function CreateNewProjectPage() {
  const router = useRouter();
  const { user } = useUser();
  const username = user?.username || 'anonymous';

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // --- Autosave Effect ---
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    if (savedDraft) {
      try {
        const draftValues: ProjectFormValues = JSON.parse(savedDraft);
        form.reset(draftValues);
      } catch (e) {
        console.error("Failed to parse autosaved draft:", e);
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    }

    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name) {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(value));
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // --- Form Submission Handler ---
  async function onSubmit(values: ProjectFormValues) {
    if (!user?.id || !user.primaryEmailAddress?.emailAddress) {
      toast.error("Authentication required", {
        description: "Please log in with a primary email address to create a project.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Ensure user exists in our PostgreSQL DB and get their internal UUID
      const { userId: pgUserId } = await createOrGetUser({
        clerkUserId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.username || undefined,
      });

      // Step 2: Create the project using the PostgreSQL user's UUID
      const newProject = await createProject({
        name: values.name,
        description: values.description,
        visibility: values.visibility,
        ownerId: pgUserId, // UPDATED: Use the PostgreSQL user's UUID here
      });

      toast.success("Stack created successfully!", {
        description: `Stack "${values.name}" has been created.`,
      });

      localStorage.removeItem(AUTOSAVE_KEY);
      router.push(`/dashboard/projects/${newProject.id}/overview`);
    } catch (error: unknown) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate character count for description
  const descriptionCharCount = form.watch("description")?.length || 0;

  // Generate slug preview
  const projectName = form.watch("name");
  const projectSlug = projectName ? projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '';
  const slugPreview = `gitstack.xyz/${username}/${projectSlug}`;


  return (
    <div className="flex min-h-screen flex-col">
      <ProjectListTopbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
        <div className="grid grid-cols-1">
          <h1 className="text-xl font-bold tracking-tight">Create a New Stack</h1>
          <p>Stacks are just repos that contain a project&apos;s files and version history.</p>
        </div>
          <Link href="/dashboard/projects" passHref>
            <Button variant="outline" className='rounded-full cursor-pointer'>Cancel</Button>
          </Link>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Project Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stack Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Stack" {...field} />
                  </FormControl>
                  {/* Slug Preview */}
                  {projectName && (
                    <FormDescription className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-1">Preview:</span>
                      <span className="font-mono text-xs bg-muted p-1 rounded-sm">
                        {slugPreview}
                      </span>
                    </FormDescription>
                  )}
                  <FormDescription>
                    This will be the primary name for your stack.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your stack..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  {/* Live Character Count */}
                  <FormDescription className="flex justify-between text-muted-foreground">
                    <span>A short description helps identify your stack.</span>
                    <span>{descriptionCharCount}/200</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visibility Field */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Stack Visibility</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="private" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Private (Only you and invited collaborators can see this stack)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="public" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Public (Anyone can view this stack)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-full cursor-pointer">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating stack..." : "Create stack"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}