// convex/projects.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel"; // Import Id type

/**
 * Creates a new project for the authenticated user.
 *
 * @param args.name - The name of the project.
 * @param args.description - (Optional) A description for the project.
 * @param args.visibility - The visibility of the project ("public" or "private").
 * @returns The ID of the newly created project.
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Assuming Clerk user ID maps directly to our Convex user's clerkUserId
    const clerkUserId = identity.subject;

    // Find the Convex user ID associated with the Clerk user ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      // This case should ideally not happen if user creation is handled correctly during auth.
      // However, it's a good safeguard.
      throw new Error("Convex user not found for authenticated Clerk user.");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      visibility: args.visibility,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ownerId: user._id, // Link the project to the Convex user's ID
      stats: {
        snapshots: 0,
        deployments: 0,
      },
    });

    return projectId;
  },
});

/**
 * Retrieves a list of all projects owned by the authenticated user.
 *
 * @returns An array of project documents.
 */
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // If not authenticated, return an empty array or throw an error based on desired behavior
      return [];
    }

    const clerkUserId = identity.subject;

    // Find the Convex user ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return []; // No Convex user means no projects owned by them
    }

    // Fetch projects owned by this user
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();

    return projects;
  },
});

/**
 * Retrieves the details of a single project by its ID, ensuring the authenticated user is the owner.
 *
 * @param args.projectId - The ID of the project to retrieve.
 * @returns The project document, or null if not found or not owned by the user.
 */
export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Not authenticated
    }

    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return null; // No Convex user, cannot own project
    }

    const project = await ctx.db.get(args.projectId);

    // Ensure the project exists and is owned by the authenticated user
    if (!project || project.ownerId !== user._id) {
      return null; // Project not found or user is not the owner
    }

    return project;
  },
});

// You might also want a mutation to update project stats (e.g., after a new snapshot)
// export const updateProjectStats = mutation({
//   args: {
//     projectId: v.id("projects"),
//     snapshotsIncrement: v.optional(v.number()),
//     deploymentsIncrement: v.optional(v.number()),
//     lastDeployed: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     // ... authentication and ownership checks ...
//     const project = await ctx.db.get(args.projectId);
//     if (!project) throw new Error("Project not found");

//     const newStats = { ...project.stats };
//     if (args.snapshotsIncrement) {
//       newStats.snapshots = (newStats.snapshots || 0) + args.snapshotsIncrement;
//     }
//     if (args.deploymentsIncrement) {
//       newStats.deployments = (newStats.deployments || 0) + args.deploymentsIncrement;
//     }
//     if (args.lastDeployed) {
//       newStats.lastDeployed = args.lastDeployed;
//     }

//     await ctx.db.patch(args.projectId, { stats: newStats, updatedAt: Date.now() });
//   },
// });