"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PathBreadcrumbs({ baseHref, path, onChangePath }: { baseHref: string; path: string; onChangePath?: (p: string) => void }) {
  const parts = (path || "").split("/").filter(Boolean);
  const crumbs = [{ name: "Code", href: baseHref }, ...parts.map((p, i) => ({ name: p, href: `${baseHref}/${parts.slice(0, i + 1).join("/")}` }))];
  return (
    <nav className="text-sm text-muted-foreground flex items-center flex-wrap gap-1">
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 mx-1" />}
          <Link href={c.href} className="hover:text-foreground">{c.name}</Link>
        </span>
      ))}
    </nav>
  );
}