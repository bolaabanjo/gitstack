// app/dashboard/projects/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import ProjectListTopbar from "@/components/project-list-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  createOrGetUser,
  createProject,
  type Project,
} from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const {
    data: pgUser,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["pgUser", user?.id],
    enabled: isLoaded && !!user?.id,
    queryFn: async () => {
      if (!user) throw new Error("User not available");
      const primaryEmail = user.emailAddresses?.[0]?.emailAddress ?? "";
      return await createOrGetUser({
        clerkUserId: user.id,
        email: primaryEmail,
        name: user.fullName ?? undefined,
      });
    },
  });

  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [description, setDescription] = useState("");

  const { mutateAsync: submitCreate, isPending } = useMutation({
    mutationFn: async () => {
      if (!pgUser?.userId) throw new Error("Missing user context.");
      if (!name.trim()) throw new Error("Project name is required.");
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        ownerId: pgUser.userId,
      });
      return project;
    },
    onSuccess: (project: Project) => {
      toast.success("Project created", {
        description: `“${project.name}” is ready.`,
      });
      router.replace(`/dashboard/projects/${project.id}/overview`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create project.";
      toast.error("Error", { description: msg });
    },
  });

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col">
        <ProjectListTopbar />
        <div className="flex-1 p-4 md:p-6">
          <Skeleton className="mb-6 h-10 w-56" />
          <div className="grid gap-4">
            <Skeleton className="h-10 w-full max-w-xl" />
            <Skeleton className="h-24 w-full max-w-xl" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <ProjectListTopbar />
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div>
            <h1 className="mb-2 text-2xl font-semibold">Please sign in</h1>
            <p className="text-muted-foreground">You must be signed in to create a project.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen flex-col">
        <ProjectListTopbar />
        <div className="flex-1 p-4 md:p-6">
          <Skeleton className="mb-6 h-10 w-56" />
          <div className="grid gap-4">
            <Skeleton className="h-10 w-full max-w-xl" />
            <Skeleton className="h-24 w-full max-w-xl" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex min-h-screen flex-col">
        <ProjectListTopbar />
        <div className="flex-1 p-4 md:p-6">
          <div className="rounded-md border p-6 text-destructive">
            Failed to resolve user: {userError.message}
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCreate();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ProjectListTopbar />
      <div className="flex-1 p-4 md:p-6">
        <h1 className="mb-6 text-2xl font-semibold">Create New Project</h1>

        <form onSubmit={onSubmit} className="grid gap-6 max-w-xl">
          <div className="grid gap-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              placeholder="my-awesome-project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label>Visibility</Label>
            <RadioGroup
              value={visibility}
              onValueChange={(val) => setVisibility(val as "public" | "private")}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="cursor-pointer">
                  Public
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="cursor-pointer">
                  Private
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}