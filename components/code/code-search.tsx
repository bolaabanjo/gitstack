"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { TreeEntry } from "@/lib/api";
import { Input } from "@/components/ui/input";

export function CodeSearch({ entries, onResults }: { entries: TreeEntry[]; onResults: (list: TreeEntry[]) => void }) {
  const [q, setQ] = useState("");
  const fuse = useMemo(() => new Fuse(entries, { keys: ["name"], threshold: 0.4 }), [entries]);
  const onChange = (v: string) => {
    setQ(v);
    if (!v) onResults(entries);
    else onResults(fuse.search(v).map(r => r.item));
  };
  return <Input placeholder="Search files..." value={q} onChange={(e) => onChange(e.target.value)} className="h-9" />;
}