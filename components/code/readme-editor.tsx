"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { updateReadmeApi } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MDEditor = dynamic(() => import("@uiw/react-md-editor").then(m => m.default), { ssr: false });

export function ReadmeEditor({ projectId, branch, initial, onClose }: { projectId: string; branch: string; initial: string; onClose: () => void }) {
  const [value, setValue] = useState<string>(initial || "");
  const { user } = useUser();

  async function save() {
    await updateReadmeApi(projectId, { branch, content: value, userId: user?.id ? undefined : undefined });
    onClose();
    // You can invalidate queries if needed (React Query) via a context hook pattern
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit README ({branch})</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div data-color-mode="dark">
            <MDEditor value={value} onChange={(v) => setValue(v || "")} height={400} preview="edit" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReadmeEditor;