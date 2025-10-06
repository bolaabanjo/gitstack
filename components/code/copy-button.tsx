"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, size = "icon" as const }: { text: string; size?: "sm" | "icon" }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setOk(true);
    setTimeout(() => setOk(false), 1200);
  }
  return (
    <Button variant="outline" size={size} onClick={copy} className={size === "icon" ? "h-8 w-8" : ""}>
      {ok ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}