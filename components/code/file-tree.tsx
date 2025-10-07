// components/code/file-tree.tsx
"use client";

import { TreeEntry } from "@/lib/api";
import { Folder, File, MoreVertical, Trash2 } from "lucide-react"; // NEW: Import MoreVertical, Trash2
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // NEW: Import Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // NEW: Import DropdownMenu components

interface FileTreeProps {
  entries: TreeEntry[];
  path: string; // The current directory path being displayed
  onOpen?: (p: string) => void;
  onDeleteFile?: (filePath: string) => void;   // NEW: Callback for deleting a file
  onDeleteFolder?: (folderPath: string) => void; // NEW: Callback for deleting a folder
}

export function FileTree({ entries, path, onOpen, onDeleteFile, onDeleteFolder }: FileTreeProps) {
  const getItemFullPath = (itemName: string) =>
    path ? `${path}/${itemName}` : itemName;

  return (
    <div className="space-y-1 text-sm">
      {entries.length === 0 && (
        <div className="text-muted-foreground text-center py-4">No files or folders here.</div>
      )}
      {entries.map((e) => {
        const isDir = e.type === "dir";
        const fullPath = getItemFullPath(e.name);

        return (
          <div key={fullPath} className="group flex items-center justify-between rounded-md transition-colors hover:bg-accent">
            <button
              className={cn("flex w-full items-center gap-2 px-2 py-1 text-left")}
              onClick={() => onOpen?.(fullPath)}
            >
              {isDir ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
              <span className="truncate">{e.name}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Add more actions here if needed later (e.g., Rename, Download) */}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent onOpen from firing
                    if (isDir && onDeleteFolder) onDeleteFolder(fullPath);
                    if (!isDir && onDeleteFile) onDeleteFile(fullPath);
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