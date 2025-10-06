"use client";

import { Branch } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function BranchPicker({ branches, value, onChange }: { branches: Branch[]; value: string; onChange?: (v: string) => void }) {
  const names = branches.map((b) => b.name);
  const current = names.includes(value) ? value : (names[0] ?? "main");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">Branch: {current}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {names.map((n) => (
          <DropdownMenuItem key={n} onClick={() => onChange?.(n)}>{n}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}