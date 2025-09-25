// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or return a user in Convex linked to a Clerk user ID
export const createOrGetUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if this user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existing) return existing._id;

    // Otherwise, create them
    const userId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
    });

    return userId;
  },
});
