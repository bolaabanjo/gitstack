"use client";

import { Tag } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export function TagList({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <Badge key={t.id} variant="outline">{t.name}</Badge>
      ))}
    </div>
  );
}