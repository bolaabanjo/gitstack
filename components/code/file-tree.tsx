"use client";

import { TreeEntry } from "@/lib/api";
import { Folder, File, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileTreeProps {
  entries?: TreeEntry[]; // make it optional to avoid crashes before data loads
  path: string;
  onOpen?: (p: string) => void;
  onDeleteFile?: (filePath: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
}

export function FileTree({
  entries = [],
  path,
  onOpen,
  onDeleteFile,
  onDeleteFolder,
}: FileTreeProps) {
  const getItemFullPath = (itemName: string) =>
    path ? `${path}/${itemName}` : itemName;

  if (entries.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-4 text-sm">
        No files or folders here.
      </div>
    );
  }

  return (
    <div className="space-y-1 text-sm">
      {entries.map((e) => {
        const isDir = e.type === "dir";
        const fullPath = getItemFullPath(e.name);

        return (
          <div
            key={fullPath}
            className="group flex items-center justify-between rounded-md transition-colors hover:bg-accent"
          >
            {/* Clickable row */}
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 px-2 py-1 text-left focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
              )}
              onClick={() => onOpen?.(fullPath)}
            >
              {isDir ? (
                <Folder className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <File className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">{e.name}</span>
            </button>

            {/* Action menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                  aria-label="Open file actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    const confirmed = confirm(
                      `Are you sure you want to delete the ${isDir ? "folder" : "file"} "${e.name}"?`
                    );
                    if (!confirmed) return;

                    if (isDir) onDeleteFolder?.(fullPath);
                    else onDeleteFile?.(fullPath);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {isDir ? "Folder" : "File"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}
