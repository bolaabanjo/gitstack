import type { PrismTheme } from "prism-react-renderer";

// Dark surface colors used by the viewer container and borders
export const codeSurface = "oklch(0.17 0 0)";     // very dark, near-black
export const codeSurfaceSoft = "oklch(0.20 0 0)"; // slightly lighter
export const codeBorder = "oklch(0.28 0 0)";      // subtle border

// Custom Prism theme (background is transparent to let the container color show)
export const codeTheme: PrismTheme = {
  plain: {
    color: "oklch(0.92 0 0)", // near white
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "oklch(0.65 0 0)" }, // muted gray
    },
    {
      types: ["punctuation"],
      style: { color: "oklch(0.90 0 0)" }, // near white
    },
    {
      types: ["property", "constant", "symbol", "deleted"],
      style: { color: "oklch(0.78 0.19 24)" }, // warm orange
    },
    {
      types: ["boolean", "number"],
      style: { color: "oklch(0.82 0.13 32)" }, // amber
    },
    {
      types: ["tag"],
      style: { color: "oklch(0.78 0.21 25)" }, // rust
    },
    {
      types: ["attr-name"],
      style: { color: "oklch(0.83 0.16 35)" }, // gold
    },
    {
      types: ["string", "char", "inserted"],
      style: { color: "oklch(0.86 0.12 155)" }, // green
    },
    {
      types: ["operator", "entity", "url"],
      style: { color: "oklch(0.84 0.08 260)" }, // lavender
    },
    {
      types: ["keyword"],
      style: { color: "oklch(0.82 0.18 262)" }, // purple
    },
    {
      types: ["function", "builtin"],
      style: { color: "oklch(0.88 0.19 22)" }, // yellow
    },
    {
      types: ["variable"],
      style: { color: "oklch(0.95 0 0)" }, // white
    },
    {
      types: ["class-name"],
      style: { color: "oklch(0.90 0.17 50)" }, // teal
    },
    {
      types: ["regex", "important"],
      style: { color: "oklch(0.86 0.2 145)" }, // green accent
    },
    { types: ["italic"], style: { fontStyle: "italic" } },
  ],
};
