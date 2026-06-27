import { eq, desc, asc, and, sql, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  events, InsertEvent,
  eventSignups, InsertEventSignup,
  paradeParticipants, InsertParadeParticipant,
  pastPresidents, InsertPastPresident,
  committeeMembers, InsertCommitteeMember,
  timelineEntries, InsertTimelineEntry,
  festivalQueens, InsertFestivalQueen,
  activityLog, InsertActivityLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Events ────────────────────────────────────────────────────────────────────
export async function listEvents(opts?: { activeOnly?: boolean; limit?: number; category?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.activeOnly) conditions.push(eq(events.isActive, true));
  if (opts?.category) conditions.push(eq(events.category, opts.category as any));
  const q = db.select().from(events);
  if (conditions.length > 0) q.where(and(...conditions));
  q.orderBy(asc(events.sortOrder), asc(events.eventDate));
  if (opts?.limit) q.limit(opts.limit);
  return q;
}

export async function getEventBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(events).values(data);
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
}

// ── Event Signups ─────────────────────────────────────────────────────────────
export async function createEventSignup(data: InsertEventSignup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(eventSignups).values(data);
}

export async function listSignupsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventSignups).where(eq(eventSignups.eventId, eventId)).orderBy(desc(eventSignups.createdAt));
}

export async function countSignupsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(eventSignups).where(eq(eventSignups.eventId, eventId));
  return Number(result[0]?.count ?? 0);
}

export async function getTotalSignups() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(eventSignups);
  return Number(result[0]?.count ?? 0);
}

export async function updateSignupStatus(id: number, status: "pending" | "confirmed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventSignups).set({ status }).where(eq(eventSignups.id, id));
}

// ── Parade Participants ───────────────────────────────────────────────────────
export async function createParadeParticipant(data: InsertParadeParticipant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(paradeParticipants).values(data);
}

export async function listParadeParticipants(opts?: { year?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.year) conditions.push(eq(paradeParticipants.year, opts.year));
  if (opts?.status) conditions.push(eq(paradeParticipants.status, opts.status as any));
  const q = db.select().from(paradeParticipants);
  if (conditions.length > 0) q.where(and(...conditions));
  q.orderBy(desc(paradeParticipants.createdAt));
  return q;
}

export async function getParadeParticipantByEmail(email: string, year: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(paradeParticipants)
    .where(and(eq(paradeParticipants.contactEmail, email), eq(paradeParticipants.year, year)))
    .limit(1);
  return result[0] ?? null;
}

export async function getParadeParticipantByEmailAnyYear(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paradeParticipants)
    .where(eq(paradeParticipants.contactEmail, email))
    .orderBy(desc(paradeParticipants.year));
}

export async function updateParadeStatus(id: number, status: "pending" | "approved" | "rejected" | "waitlisted", notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status };
  if (notes !== undefined) updateData.notes = notes;
  await db.update(paradeParticipants).set(updateData).where(eq(paradeParticipants.id, id));
}

export async function countParadeParticipants(year?: number) {
  const db = await getDb();
  if (!db) return 0;
  const q = db.select({ count: sql<number>`count(*)` }).from(paradeParticipants);
  if (year) q.where(eq(paradeParticipants.year, year));
  const result = await q;
  return Number(result[0]?.count ?? 0);
}

// ── Past Presidents ───────────────────────────────────────────────────────────
export async function listPastPresidents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pastPresidents).orderBy(desc(pastPresidents.yearStart));
}

export async function createPastPresident(data: InsertPastPresident) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pastPresidents).values(data);
}

export async function updatePastPresident(id: number, data: Partial<InsertPastPresident>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pastPresidents).set(data).where(eq(pastPresidents.id, id));
}

export async function deletePastPresident(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pastPresidents).where(eq(pastPresidents.id, id));
}

// ── Committee Members ─────────────────────────────────────────────────────────
export async function listCommitteeMembers(opts?: { activeOnly?: boolean; committee?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.activeOnly) conditions.push(eq(committeeMembers.isActive, true));
  if (opts?.committee) conditions.push(eq(committeeMembers.committee, opts.committee));
  const q = db.select().from(committeeMembers);
  if (conditions.length > 0) q.where(and(...conditions));
  q.orderBy(asc(committeeMembers.committee), asc(committeeMembers.name));
  return q;
}

export async function createCommitteeMember(data: InsertCommitteeMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(committeeMembers).values(data);
}

export async function updateCommitteeMember(id: number, data: Partial<InsertCommitteeMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(committeeMembers).set(data).where(eq(committeeMembers.id, id));
}

export async function deleteCommitteeMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(committeeMembers).where(eq(committeeMembers.id, id));
}

// ── Timeline Entries ──────────────────────────────────────────────────────────
export async function listTimelineEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timelineEntries).orderBy(asc(timelineEntries.year));
}

export async function createTimelineEntry(data: InsertTimelineEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(timelineEntries).values(data);
}

export async function updateTimelineEntry(id: number, data: Partial<InsertTimelineEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(timelineEntries).set(data).where(eq(timelineEntries.id, id));
}

export async function deleteTimelineEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(timelineEntries).where(eq(timelineEntries.id, id));
}

// ── Festival Queens ───────────────────────────────────────────────────────────
export async function listFestivalQueens() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(festivalQueens).orderBy(desc(festivalQueens.year), asc(festivalQueens.sortOrder));
}

export async function createFestivalQueen(data: InsertFestivalQueen) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(festivalQueens).values(data);
}

export async function updateFestivalQueen(id: number, data: Partial<InsertFestivalQueen>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(festivalQueens).set(data).where(eq(festivalQueens.id, id));
}

export async function deleteFestivalQueen(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(festivalQueens).where(eq(festivalQueens.id, id));
}

// ── Activity Log ──────────────────────────────────────────────────────────────
export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(activityLog).values(data);
  } catch {
    // Non-critical — don't throw
  }
}

export async function listActivityLog(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(limit);
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalSignups: 0, totalParade: 0, totalEvents: 0, totalQueens: 0, totalMembers: 0 };
  const currentYear = new Date().getFullYear();
  const [signupsResult, paradeResult, eventsResult, queensResult, membersResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(eventSignups),
    db.select({ count: sql<number>`count(*)` }).from(paradeParticipants).where(eq(paradeParticipants.year, currentYear)),
    db.select({ count: sql<number>`count(*)` }).from(events).where(eq(events.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(festivalQueens),
    db.select({ count: sql<number>`count(*)` }).from(committeeMembers).where(eq(committeeMembers.isActive, true)),
  ]);
  return {
    totalSignups: Number(signupsResult[0]?.count ?? 0),
    totalParade:  Number(paradeResult[0]?.count ?? 0),
    totalEvents:  Number(eventsResult[0]?.count ?? 0),
    totalQueens:  Number(queensResult[0]?.count ?? 0),
    totalMembers: Number(membersResult[0]?.count ?? 0),
  };
}

// ── Live Parade: Units ────────────────────────────────────────────────────────
import {
  paradeUnits, InsertParadeUnit,
  paradeCheckpoints, InsertParadeCheckpoint,
  paradeCheckpointLogs,
  paradeSession, InsertParadeSession,
} from "../drizzle/schema";

export async function listParadeUnits(year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paradeUnits).where(eq(paradeUnits.year, year)).orderBy(asc(paradeUnits.unitNumber));
}

export async function getParadeUnit(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(paradeUnits).where(eq(paradeUnits.id, id)).limit(1);
  return rows[0];
}

export async function createParadeUnit(data: InsertParadeUnit) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(paradeUnits).values(data);
}

export async function updateParadeUnit(id: number, data: Partial<InsertParadeUnit>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(paradeUnits).set({ ...data, updatedAt: new Date() }).where(eq(paradeUnits.id, id));
}

export async function deleteParadeUnit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(paradeUnits).where(eq(paradeUnits.id, id));
}

export async function bulkCreateParadeUnits(units: InsertParadeUnit[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  for (const unit of units) {
    await db.insert(paradeUnits).values(unit);
  }
}

// ── Live Parade: Checkpoints ──────────────────────────────────────────────────
export async function listParadeCheckpoints() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paradeCheckpoints).where(eq(paradeCheckpoints.isActive, true)).orderBy(asc(paradeCheckpoints.routeOrder));
}

export async function createParadeCheckpoint(data: InsertParadeCheckpoint) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(paradeCheckpoints).values(data);
}

// ── Live Parade: Session ──────────────────────────────────────────────────────
export async function getParadeSessionByYear(year: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(paradeSession).where(eq(paradeSession.year, year)).limit(1);
  return rows[0];
}

export async function upsertParadeSession(year: number, data: Partial<InsertParadeSession>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getParadeSessionByYear(year);
  if (existing) {
    await db.update(paradeSession).set({ ...data, updatedAt: new Date() }).where(eq(paradeSession.year, year));
  } else {
    await db.insert(paradeSession).values({ year, ...data });
  }
}

// ── Live Parade: Checkpoint Logs ──────────────────────────────────────────────
export async function listCheckpointLogs(unitId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (unitId !== undefined) {
    return db.select().from(paradeCheckpointLogs).where(eq(paradeCheckpointLogs.unitId, unitId)).orderBy(asc(paradeCheckpointLogs.passedAt));
  }
  return db.select().from(paradeCheckpointLogs).orderBy(asc(paradeCheckpointLogs.passedAt));
}
