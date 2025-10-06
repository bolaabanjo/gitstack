// components/query-provider.tsx
"use client"; // This directive marks the component as a Client Component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Create a QueryClient instance outside the component to prevent re-creation on renders
const queryClient = new QueryClient();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}