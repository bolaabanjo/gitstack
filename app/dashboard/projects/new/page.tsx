// app/dashboard/projects/new/page.tsx

"use client";

import React from 'react'; // Removed useState as it's not used directly
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import { Loader2 } from 'lucide-react'; // Removed PlusCircle as it's not used directly
import Link from 'next/link';

// --- Form Schema Definition with Zod ---
const projectFormSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }).max(50, { message: "Project name cannot exceed 50 characters." }),
  description: z.string().max(200, { message: "Description cannot exceed 200 characters." }).optional(),
  visibility: z
  .enum(["public", "private"])
  .refine((val) => val, { message: "Project visibility is required." }),

});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function CreateNewProjectPage() {
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // --- Form Submission Handler ---
  async function onSubmit(values: ProjectFormValues) {
    try {
      const newProjectId = await createProject({
        name: values.name,
        description: values.description,
        visibility: values.visibility,
      });

      toast.success("Project created successfully!", {
        description: `Project "${values.name}" has been created.`,
      });

      router.push(`/dashboard/projects/${newProjectId}/overview`);
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error("Failed to create project:", error);
      toast.error("Failed to create project", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.", // Safely access error.message
      });
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
      <div className="grid grid-cols-1">
        <h1 className="text-3xl font-bold tracking-tight">Create a New Stack</h1>
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
                <FormDescription>
                  A short description helps identify your stack.
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
  );
}