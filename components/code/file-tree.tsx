"use client";

import { TreeEntry } from "@/lib/api";
import { Folder, File } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileTree({ entries, path, onOpen }: { entries: TreeEntry[]; path: string; onOpen?: (p: string) => void }) {
  return (
    <div className="space-y-1 text-sm">
      {entries.map((e) => {
        const isDir = e.type === "dir";
        const full = [path, e.name].filter(Boolean).join("/");
        return (
          <button
            key={full}
            className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-accent text-left")}
            onClick={() => onOpen?.(full)}
          >
            {isDir ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
            <span className="truncate">{e.name}</span>
          </button>
        );
      })}
    </div>
  );
}