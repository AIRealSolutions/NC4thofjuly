import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { logActivity } from "./db";
import { getParadeState } from "./paradeSocket";

// ── Admin guard ───────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "committee") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin or committee access required" });
  }
  return next({ ctx });
});

const strictAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ── Events Router ─────────────────────────────────────────────────────────────
const eventsRouter = router({
  list: publicProcedure
    .input(z.object({ activeOnly: z.boolean().optional(), limit: z.number().optional(), category: z.string().optional() }).optional())
    .query(({ input }) => db.listEvents(input ?? {})),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => db.getEventBySlug(input.slug)),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getEventById(input.id)),

  create: adminProcedure
    .input(z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      category: z.enum(["parade","ceremony","entertainment","arts","sports","family","ball","fireworks","other"]),
      eventDate: z.date().optional(),
      endDate: z.date().optional(),
      location: z.string().optional(),
      imageUrl: z.string().optional(),
      allowSignup: z.boolean().optional(),
      allowVolunteer: z.boolean().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.createEvent(input);
      await logActivity({ action: "Created event", entityType: "event", performedBy: ctx.user.name ?? ctx.user.email ?? "Admin", details: input.title });
      return { success: true };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        category: z.enum(["parade","ceremony","entertainment","arts","sports","family","ball","fireworks","other"]).optional(),
        eventDate: z.date().optional(),
        endDate: z.date().optional(),
        location: z.string().optional(),
        imageUrl: z.string().optional(),
        allowSignup: z.boolean().optional(),
        allowVolunteer: z.boolean().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.updateEvent(input.id, input.data);
      await logActivity({ action: "Updated event", entityType: "event", entityId: input.id, performedBy: ctx.user.name ?? "Admin" });
      return { success: true };
    }),

  delete: strictAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.deleteEvent(input.id);
      await logActivity({ action: "Deleted event", entityType: "event", entityId: input.id, performedBy: ctx.user.name ?? "Admin" });
      return { success: true };
    }),
});

// ── Event Signups Router ──────────────────────────────────────────────────────
const signupsRouter = router({
  create: publicProcedure
    .input(z.object({
      eventId: z.number(),
      type: z.enum(["attendee", "volunteer"]).default("attendee"),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      partySize: z.number().min(1).max(20).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createEventSignup(input);
      await logActivity({ action: "Event signup", entityType: "event_signup", entityId: input.eventId, performedBy: `${input.firstName} ${input.lastName}`, details: input.type });
      return { success: true };
    }),

  listByEvent: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ input }) => db.listSignupsByEvent(input.eventId)),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["pending","confirmed","cancelled"]) }))
    .mutation(async ({ input }) => {
      await db.updateSignupStatus(input.id, input.status);
      return { success: true };
    }),
});

// ── Parade Router ─────────────────────────────────────────────────────────────
const paradeRouter = router({
  register: publicProcedure
    .input(z.object({
      isReturning: z.boolean().default(false),
      year: z.number(),
      entryName: z.string().min(1),
      entryType: z.enum(["float","marching_band","vehicle","walking_group","equestrian","other"]),
      description: z.string().optional(),
      contactFirstName: z.string().min(1),
      contactLastName: z.string().min(1),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
      organization: z.string().optional(),
      estimatedLength: z.string().optional(),
      numberOfPeople: z.number().optional(),
      requiresElectricity: z.boolean().default(false),
      specialRequirements: z.string().optional(),
      parkingSpots: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createParadeParticipant(input);
      await logActivity({
        action: input.isReturning ? "Parade renewal" : "New parade registration",
        entityType: "parade",
        performedBy: `${input.contactFirstName} ${input.contactLastName}`,
        details: input.entryName,
      });
      return { success: true };
    }),

  checkReturning: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(({ input }) => db.getParadeParticipantByEmailAnyYear(input.email)),

  list: adminProcedure
    .input(z.object({ year: z.number().optional(), status: z.string().optional() }).optional())
    .query(({ input }) => db.listParadeParticipants(input ?? {})),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending","approved","rejected","waitlisted"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.updateParadeStatus(input.id, input.status, input.notes);
      await logActivity({ action: `Parade entry ${input.status}`, entityType: "parade", entityId: input.id, performedBy: ctx.user.name ?? "Admin" });
      return { success: true };
    }),

  count: publicProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(({ input }) => db.countParadeParticipants(input?.year)),
});

// ── Heritage Router ───────────────────────────────────────────────────────────
const heritageRouter = router({
  presidents: publicProcedure.query(() => db.listPastPresidents()),

  createPresident: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      yearStart: z.number(),
      yearEnd: z.number().optional(),
      bio: z.string().optional(),
      photoUrl: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => { await db.createPastPresident(input); return { success: true }; }),

  updatePresident: adminProcedure
    .input(z.object({ id: z.number(), data: z.object({ name: z.string().optional(), yearStart: z.number().optional(), yearEnd: z.number().optional(), bio: z.string().optional(), photoUrl: z.string().optional() }) }))
    .mutation(async ({ input }) => { await db.updatePastPresident(input.id, input.data); return { success: true }; }),

  deletePresident: strictAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => { await db.deletePastPresident(input.id); return { success: true }; }),

  timeline: publicProcedure.query(() => db.listTimelineEntries()),

  createTimeline: adminProcedure
    .input(z.object({
      year: z.number(),
      title: z.string().min(1),
      description: z.string().min(1),
      imageUrl: z.string().optional(),
      isMilestone: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => { await db.createTimelineEntry(input); return { success: true }; }),

  updateTimeline: adminProcedure
    .input(z.object({ id: z.number(), data: z.object({ year: z.number().optional(), title: z.string().optional(), description: z.string().optional(), imageUrl: z.string().optional(), isMilestone: z.boolean().optional() }) }))
    .mutation(async ({ input }) => { await db.updateTimelineEntry(input.id, input.data); return { success: true }; }),

  deleteTimeline: strictAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => { await db.deleteTimelineEntry(input.id); return { success: true }; }),
});

// ── Committees Router ─────────────────────────────────────────────────────────
const committeesRouter = router({
  list: publicProcedure
    .input(z.object({ activeOnly: z.boolean().optional(), committee: z.string().optional() }).optional())
    .query(({ input }) => db.listCommitteeMembers(input ?? {})),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      committee: z.string().optional(),
      yearStart: z.number(),
      yearEnd: z.number().optional(),
      bio: z.string().optional(),
      photoUrl: z.string().optional(),
      email: z.string().email().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => { await db.createCommitteeMember(input); return { success: true }; }),

  update: adminProcedure
    .input(z.object({ id: z.number(), data: z.object({ name: z.string().optional(), role: z.string().optional(), committee: z.string().optional(), yearStart: z.number().optional(), yearEnd: z.number().optional(), bio: z.string().optional(), email: z.string().optional(), isActive: z.boolean().optional() }) }))
    .mutation(async ({ input }) => { await db.updateCommitteeMember(input.id, input.data); return { success: true }; }),

  delete: strictAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => { await db.deleteCommitteeMember(input.id); return { success: true }; }),
});

// ── Queens Router ─────────────────────────────────────────────────────────────
const queensRouter = router({
  list: publicProcedure.query(() => db.listFestivalQueens()),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      year: z.number(),
      title: z.string().optional(),
      bio: z.string().optional(),
      photoUrl: z.string().optional(),
      hometown: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => { await db.createFestivalQueen(input); return { success: true }; }),

  update: adminProcedure
    .input(z.object({ id: z.number(), data: z.object({ name: z.string().optional(), year: z.number().optional(), title: z.string().optional(), bio: z.string().optional(), photoUrl: z.string().optional(), hometown: z.string().optional() }) }))
    .mutation(async ({ input }) => { await db.updateFestivalQueen(input.id, input.data); return { success: true }; }),

  delete: strictAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => { await db.deleteFestivalQueen(input.id); return { success: true }; }),
});

// ── Admin Router ──────────────────────────────────────────────────────────────
const adminRouter = router({
  stats: adminProcedure.query(() => db.getDashboardStats()),
  activityLog: adminProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => db.listActivityLog(input?.limit ?? 20)),
  users: strictAdminProcedure.query(async () => {
    const d = await db.getDb();
    if (!d) return [];
    const { users: usersTable } = await import("../drizzle/schema");
    const { desc: descFn } = await import("drizzle-orm");
    return d.select().from(usersTable).orderBy(descFn(usersTable.createdAt));
  }),
  updateUserRole: strictAdminProcedure
    .input(z.object({ id: z.number(), role: z.enum(["user","admin","committee"]) }))
    .mutation(async ({ input }) => {
      const d = await db.getDb();
      if (!d) throw new Error("DB unavailable");
      const { users: usersTable } = await import("../drizzle/schema");
      const { eq: eqFn } = await import("drizzle-orm");
      await d.update(usersTable).set({ role: input.role }).where(eqFn(usersTable.id, input.id));
      return { success: true };
    }),
});

// ── Live Parade Router ──────────────────────────────────────────────────────
const paradeLiveRouter = router({
  // Get full parade state snapshot (units, session, checkpoints)
  state: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(({ input }) => getParadeState(input.year)),

  // List all units for a year
  units: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(({ input }) => db.listParadeUnits(input.year)),

  // Get checkpoints (route stations)
  checkpoints: publicProcedure
    .query(() => db.listParadeCheckpoints()),

  // Get session info
  session: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(({ input }) => db.getParadeSessionByYear(input.year)),

  // Admin: create/update session
  upsertSession: adminProcedure
    .input(z.object({
      year: z.number(),
      status: z.enum(["setup","staging","active","completed"]).optional(),
      averageGapSeconds: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { year, ...data } = input;
      await db.upsertParadeSession(year, data);
      return { success: true };
    }),

  // Admin: create a unit
  createUnit: adminProcedure
    .input(z.object({
      year: z.number(),
      unitNumber: z.number(),
      unitName: z.string(),
      entryType: z.string().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
      stagingZone: z.string().optional(),
      stagingSpot: z.string().optional(),
      participantId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createParadeUnit(input);
      return { success: true };
    }),

  // Admin: update a unit
  updateUnit: adminProcedure
    .input(z.object({
      id: z.number(),
      unitNumber: z.number().optional(),
      unitName: z.string().optional(),
      entryType: z.string().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
      stagingZone: z.string().optional(),
      stagingSpot: z.string().optional(),
      status: z.enum(["staged","called","marching","completed","scratched"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateParadeUnit(id, data);
      return { success: true };
    }),

  // Admin: delete a unit
  deleteUnit: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteParadeUnit(input.id);
      return { success: true };
    }),

  // Admin: bulk import units from approved participants
  bulkImportFromParticipants: adminProcedure
    .input(z.object({ year: z.number() }))
    .mutation(async ({ input }) => {
      const participants = await db.listParadeParticipants({ year: input.year, status: "approved" });
      const existingUnits = await db.listParadeUnits(input.year);
      const existingParticipantIds = new Set(existingUnits.map((u) => u.participantId).filter(Boolean));
      let added = 0;
      let nextNumber = (existingUnits.length > 0 ? Math.max(...existingUnits.map((u) => u.unitNumber)) : 0) + 1;
      for (const p of participants) {
        if (existingParticipantIds.has(p.id)) continue;
        await db.createParadeUnit({
          year: input.year,
          unitNumber: nextNumber++,
          unitName: p.entryName,
          entryType: p.entryType,
          contactName: `${p.contactFirstName} ${p.contactLastName}`,
          contactPhone: p.contactPhone ?? undefined,
          stagingZone: p.stagingZone ?? undefined,
          participantId: p.id,
          status: "staged",
        });
        added++;
      }
      return { success: true, added };
    }),

  // Get checkpoint logs for a unit or all units
  checkpointLogs: publicProcedure
    .input(z.object({ unitId: z.number().optional() }))
    .query(({ input }) => db.listCheckpointLogs(input.unitId)),
});

// ── App Router ────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  events: eventsRouter,
  signups: signupsRouter,
  parade: paradeRouter,
  heritage: heritageRouter,
  committees: committeesRouter,
  queens: queensRouter,
  admin: adminRouter,
  paradeLive: paradeLiveRouter,
});

export type AppRouter = typeof appRouter;
