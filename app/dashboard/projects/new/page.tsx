// app/dashboard/projects/new/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, createOrGetUser } from '@/lib/api';
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
import { Loader2, Save, Globe, Lock, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import ProjectListTopbar from '@/components/project-list-topbar';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
  const [hasDraft, setHasDraft] = useState(false);

  // --- Autosave Effect ---
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    if (savedDraft) {
      try {
        const draftValues: ProjectFormValues = JSON.parse(savedDraft);
        form.reset(draftValues);
        setHasDraft(true);
      } catch (e) {
        console.error("Failed to parse autosaved draft:", e);
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    }

    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name) {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(value));
        setHasDraft(true);
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
      const { userId: pgUserId } = await createOrGetUser({
        clerkUserId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.username || undefined,
      });

      const newProject = await createProject({
        name: values.name,
        description: values.description,
        visibility: values.visibility,
        ownerId: pgUserId,
      });

      toast.success("Project created successfully!", {
        description: `Project "${values.name}" has been created.`,
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
    <div className="flex min-h-screen flex-col bg-background">
      <ProjectListTopbar />
      <div className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create a New Project</h1>
                <p className="text-muted-foreground">
                  Projects are version-controlled repositories that contain your files and history.
                </p>
                {hasDraft && (
                  <Badge variant="secondary" className="mt-2 gap-1">
                    <Save className="h-3 w-3" />
                    Draft auto-saved
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border bg-card p-6 md:p-8 shadow-sm"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Project Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Project Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="My Awesome Project" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      {projectName && (
                        <FormDescription className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-3 w-3" />
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {slugPreview}
                          </span>
                        </FormDescription>
                      )}
                      <FormDescription>
                        This will be the primary identifier for your project.
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
                      <FormLabel className="text-base">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief description of your project..."
                          className="resize-y min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Help others understand what your project is about.</span>
                        <span className={descriptionCharCount > 180 ? "text-orange-500" : ""}>
                          {descriptionCharCount}/200
                        </span>
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
                    <FormItem>
                      <FormLabel className="text-base">Project Visibility</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid gap-3"
                        >
                          <FormItem className="relative">
                            <FormControl>
                              <RadioGroupItem value="private" id="private" className="peer sr-only" />
                            </FormControl>
                            <FormLabel
                              htmlFor="private"
                              className="flex items-start gap-3 rounded-lg border-2 border-muted p-4 cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                            >
                              <Lock className="h-5 w-5 mt-0.5 text-muted-foreground peer-data-[state=checked]:text-primary" />
                              <div className="flex-1">
                                <p className="font-medium">Private</p>
                                <p className="text-sm text-muted-foreground">
                                  Only you and invited collaborators can see this project
                                </p>
                              </div>
                            </FormLabel>
                          </FormItem>
                          
                          <FormItem className="relative">
                            <FormControl>
                              <RadioGroupItem value="public" id="public" className="peer sr-only" />
                            </FormControl>
                            <FormLabel
                              htmlFor="public"
                              className="flex items-start gap-3 rounded-lg border-2 border-muted p-4 cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                            >
                              <Globe className="h-5 w-5 mt-0.5 text-muted-foreground peer-data-[state=checked]:text-primary" />
                              <div className="flex-1">
                                <p className="font-medium">Public</p>
                                <p className="text-sm text-muted-foreground">
                                  Anyone can view this project
                                </p>
                              </div>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Link href="/dashboard/projects" className="flex-1">
                    <Button type="button" variant="outline" className="w-full h-11">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading} className="flex-1 h-11">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}