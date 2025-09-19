// convex/snapshots.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSnapshot = mutation({
  args: {
    userId: v.id("users"), // Now requires a valid userId
    files: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const snapshotId = await ctx.db.insert("snapshots", {
      userId: args.userId,
      timestamp,
      files: args.files,
    });
    return snapshotId;
  },
});

export const getSnapshots = query({
  args: {
    userId: v.id("users"), // Now requires a valid userId
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("snapshots")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const getSnapshot = query({
  args: {
    snapshotId: v.id("snapshots"),
    userId: v.id("users"), // Ensure user owns the snapshot
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (snapshot && snapshot.userId === args.userId) {
      return snapshot;
    }
    return null; // Or throw an error for unauthorized access
  },
});

export const deleteSnapshot = mutation({
  args: {
    snapshotId: v.id("snapshots"),
    userId: v.id("users"), // Ensure user owns the snapshot
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (snapshot && snapshot.userId === args.userId) {
      await ctx.db.delete(args.snapshotId);
    } else {
      console.warn(`Attempted to delete unauthorized snapshot: ${args.snapshotId} by user ${args.userId}`);
    }
  },
});