// convex/cliAuth.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Create a new pending auth request
export const createAuthRequest = mutation({
  args: {
    cliAuthToken: v.string(),
    createdAt: v.number(), // timestamp from CLI
  },
  handler: async (ctx, args) => {
    // Optional: check if request already exists
    const existing = await ctx.db
      .query("cliAuthRequests")
      .withIndex("by_cliAuthToken", (q) => q.eq("cliAuthToken", args.cliAuthToken))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("cliAuthRequests", {
      cliAuthToken: args.cliAuthToken,
      createdAt: args.createdAt,
      status: "pending",
    });
  },
});

// 2. Mark the request as completed from the web side
export const completeAuthRequest = mutation({
  args: {
    cliAuthToken: v.string(),
    clerkUserId: v.string(),
    convexUserId: v.id("users"),
    clerkSessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("cliAuthRequests")
      .withIndex("by_cliAuthToken", (q) => q.eq("cliAuthToken", args.cliAuthToken))
      .first();

    if (!request) {
      throw new Error(`No auth request found for token ${args.cliAuthToken}`);
    }

    await ctx.db.patch(request._id, {
      status: "completed",
      clerkUserId: args.clerkUserId,
      convexUserId: args.convexUserId,
      clerkSessionToken: args.clerkSessionToken,
      completedAt: Date.now(),
    });

    return true;
  },
});

// 3. CLI polls this to check if the signup is done
export const getAuthRequestStatus = query({
  args: {
    cliAuthToken: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("cliAuthRequests")
      .withIndex("by_cliAuthToken", (q) => q.eq("cliAuthToken", args.cliAuthToken))
      .first();

    if (!request) return { status: "not_found" };

    return {
      status: request.status,
      clerkUserId: request.clerkUserId,
      convexUserId: request.convexUserId,
      clerkSessionToken: request.clerkSessionToken,
      completedAt: request.completedAt,
    };
  },
});
