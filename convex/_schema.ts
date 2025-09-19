// convex/_schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(), // Clerk's unique user ID
    email: v.string(), // User's email, for display/reference
    createdAt: v.number(),
    lastLogin: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]).index("by_email", ["email"]),

  snapshots: defineTable({
    userId: v.id("users"),
    timestamp: v.number(),
    files: v.array(v.string()),
  }).index("by_userId", ["userId"]),
});