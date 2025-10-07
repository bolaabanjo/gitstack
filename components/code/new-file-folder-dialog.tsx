// components/code/new-file-folder-dialog.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { File, Folder, Loader2 } from "lucide-react";
// Removed useUser import as pgUserId is now passed as a prop
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFile, createFolder, Snapshot } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


// --- Zod Schemas for Validation ---
const baseSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty." }).max(100, { message: "Name too long." }),
  type: z.enum(["file", "folder"], { message: "Please select a type." }),
});

const fileSchema = baseSchema.extend({
  type: z.literal("file"),
  content: z.string().optional(),
});

const folderSchema = baseSchema.extend({
  type: z.literal("folder"),
});

const formSchema = z.union([fileSchema, folderSchema]);
type FormValues = z.infer<typeof formSchema>;


interface NewFileFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  branch: string;
  currentPath: string; // The path where the new item will be created (e.g., "src/components")
  pgUserId: string;     // NEW: Pass the PostgreSQL UUID here
}

export function NewFileFolderDialog({
  isOpen,
  onClose,
  projectId,
  branch,
  currentPath,
  pgUserId, // NEW: Accept pgUserId as a prop
}: NewFileFolderDialogProps) {
  // Removed useUser hook
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "file",
    },
  });

  const selectedType = form.watch("type");

  const createFileMutation = useMutation({
    mutationFn: ({
      projectId,
      branch,
      path,
      content,
      userId,
    }: {
      projectId: string;
      branch: string;
      path: string;
      content: string;
      userId: string;
    }) => createFile(projectId, { branch, path, content, userId }) as Promise<Snapshot>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree", projectId, branch, currentPath] });
      queryClient.invalidateQueries({ queryKey: ["snapshots", projectId] });
      toast.success("File created successfully!", { description: "The new file has been added to your project." });
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Failed to create file", { description: error.message });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: ({
      projectId,
      branch,
      path,
      userId,
    }: {
      projectId: string;
      branch: string;
      path: string;
      userId: string;
    }) => createFolder(projectId, { branch, path, userId }) as Promise<Snapshot>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree", projectId, branch, currentPath] });
      queryClient.invalidateQueries({ queryKey: ["snapshots", projectId] });
      toast.success("Folder created successfully!", { description: "The new folder has been added to your project." });
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Failed to create folder", { description: error.message });
    },
  });

  async function onSubmit(values: FormValues) {
    if (!pgUserId) { // Use pgUserId prop
      toast.error("User not loaded", { description: "PostgreSQL user ID is not available. Please try again." });
      return;
    }

    const fullPath = currentPath ? `${currentPath}/${values.name}` : values.name;
    // const userId = user.id; // Removed, now using pgUserId prop

    if (values.type === "file") {
      const contentBase64 = Buffer.from(values.content || "", 'utf-8').toString('base64');
      await createFileMutation.mutateAsync({
        projectId,
        branch,
        path: fullPath,
        content: contentBase64,
        userId: pgUserId, // Use pgUserId prop
      });
    } else { // type === "folder"
      await createFolderMutation.mutateAsync({
        projectId,
        branch,
        path: fullPath,
        userId: pgUserId, // Use pgUserId prop
      });
    }
  }

  const isPending = createFileMutation.isPending || createFolderMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Create a new file or folder in {" "}
            <span className="font-mono text-muted-foreground">{currentPath || "root"}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="file" id="type-file" />
                        </FormControl>
                        <Label htmlFor="type-file" className="flex items-center gap-1 cursor-pointer">
                          <File className="h-4 w-4" /> File
                        </Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="folder" id="type-folder" />
                        </FormControl>
                        <Label htmlFor="type-folder" className="flex items-center gap-1 cursor-pointer">
                          <Folder className="h-4 w-4" /> Folder
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name">Name</Label>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder={selectedType === "file" ? "my-new-file.txt" : "my-new-folder"}
                      className="col-span-3"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedType === "file" ? `e.g., 'index.ts' or 'components/MyComponent.tsx'` : `e.g., 'src' or 'config/database'`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "file" && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="content">Initial Content (Optional)</Label>
                    <FormControl>
                      <Textarea
                        id="content"
                        placeholder="Add some initial content..."
                        className="min-h-[100px]"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedType === "file" ? (isPending ? "Creating file..." : "Create File") : (isPending ? "Creating folder..." : "Create Folder")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}