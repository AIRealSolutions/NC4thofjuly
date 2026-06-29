import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/mysql-core";

// ─── Core Users ───────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "committee"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Festival Events ──────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 512 }),
  category: mysqlEnum("category", [
    "parade",
    "ceremony",
    "entertainment",
    "arts",
    "sports",
    "family",
    "ball",
    "fireworks",
    "other",
  ]).default("other").notNull(),
  eventDate: timestamp("eventDate"),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 256 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  allowSignup: boolean("allowSignup").default(true).notNull(),
  allowVolunteer: boolean("allowVolunteer").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Event Signups ────────────────────────────────────────────────────────────
export const eventSignups = mysqlTable("event_signups", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  type: mysqlEnum("type", ["attendee", "volunteer"]).default("attendee").notNull(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  partySize: int("partySize").default(1),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventSignup = typeof eventSignups.$inferSelect;
export type InsertEventSignup = typeof eventSignups.$inferInsert;

// ─── Parade Participants ──────────────────────────────────────────────────────
export const paradeParticipants = mysqlTable("parade_participants", {
  id: int("id").autoincrement().primaryKey(),
  // For returning participants, link to their account
  userId: int("userId"),
  isReturning: boolean("isReturning").default(false).notNull(),
  year: int("year").notNull(),
  // Entry info
  entryName: varchar("entryName", { length: 256 }).notNull(),
  entryType: mysqlEnum("entryType", [
    "float",
    "marching_band",
    "vehicle",
    "walking_group",
    "equestrian",
    "shriners",
    "other",
  ]).default("other").notNull(),
  // Shriners-specific fields
  shrinersTempleName: varchar("shrinersTempleName", { length: 256 }),
  shrinersUnitType: mysqlEnum("shrinersUnitType", [
    "mini_cars",
    "motorcycles",
    "clown_unit",
    "marching",
    "color_guard",
    "band",
    "go_karts",
    "other",
  ]),
  shrinersVehicleCount: int("shrinersVehicleCount"),
  shrinersSpecialEquipment: text("shrinersSpecialEquipment"),
  description: text("description"),
  // Contact info
  contactFirstName: varchar("contactFirstName", { length: 128 }).notNull(),
  contactLastName: varchar("contactLastName", { length: 128 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 32 }),
  organization: varchar("organization", { length: 256 }),
  // Logistics
  estimatedLength: varchar("estimatedLength", { length: 64 }),
  numberOfPeople: int("numberOfPeople"),
  requiresElectricity: boolean("requiresElectricity").default(false).notNull(),
  specialRequirements: text("specialRequirements"),
  // Staging / parking
  stagingZone: varchar("stagingZone", { length: 64 }),
  parkingSpots: int("parkingSpots").default(1),
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected", "waitlisted"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParadeParticipant = typeof paradeParticipants.$inferSelect;
export type InsertParadeParticipant = typeof paradeParticipants.$inferInsert;

// ─── Heritage: Past Presidents ────────────────────────────────────────────────
export const pastPresidents = mysqlTable("past_presidents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  yearStart: int("yearStart").notNull(),
  yearEnd: int("yearEnd"),
  bio: text("bio"),
  photoUrl: varchar("photoUrl", { length: 512 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PastPresident = typeof pastPresidents.$inferSelect;
export type InsertPastPresident = typeof pastPresidents.$inferInsert;

// ─── Heritage: Committee Members ─────────────────────────────────────────────
export const committeeMembers = mysqlTable("committee_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  role: varchar("role", { length: 256 }).notNull(),
  committee: varchar("committee", { length: 256 }),
  yearStart: int("yearStart").notNull(),
  yearEnd: int("yearEnd"),
  bio: text("bio"),
  photoUrl: varchar("photoUrl", { length: 512 }),
  email: varchar("email", { length: 320 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommitteeMember = typeof committeeMembers.$inferSelect;
export type InsertCommitteeMember = typeof committeeMembers.$inferInsert;

// ─── Heritage: Timeline Entries ───────────────────────────────────────────────
export const timelineEntries = mysqlTable("timeline_entries", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  isMilestone: boolean("isMilestone").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineEntry = typeof timelineEntries.$inferSelect;
export type InsertTimelineEntry = typeof timelineEntries.$inferInsert;

// ─── Festival Queens ──────────────────────────────────────────────────────────
export const festivalQueens = mysqlTable("festival_queens", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  year: int("year").notNull(),
  title: varchar("title", { length: 256 }).default("Festival Queen"),
  bio: text("bio"),
  photoUrl: varchar("photoUrl", { length: 512 }),
  hometown: varchar("hometown", { length: 256 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FestivalQueen = typeof festivalQueens.$inferSelect;
export type InsertFestivalQueen = typeof festivalQueens.$inferInsert;

// ─── Activity Log ─────────────────────────────────────────────────────────────
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 256 }).notNull(),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  performedBy: varchar("performedBy", { length: 256 }),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

// ─── Live Parade: Units (ordered lineup) ─────────────────────────────────────
export const paradeUnits = mysqlTable("parade_units", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  unitNumber: int("unitNumber").notNull(),          // position in parade order
  participantId: int("participantId"),               // links to parade_participants
  unitName: varchar("unitName", { length: 256 }).notNull(),
  entryType: varchar("entryType", { length: 64 }).default("other").notNull(),
  contactName: varchar("contactName", { length: 256 }),
  contactPhone: varchar("contactPhone", { length: 32 }),
  stagingZone: varchar("stagingZone", { length: 128 }),  // e.g. "S Atlantic", "N Atlantic", "E Moore Left"
  stagingSpot: varchar("stagingSpot", { length: 64 }),   // e.g. "A1", "B3"
  // Live status
  status: mysqlEnum("status", [
    "staged",       // in staging area, not yet called
    "called",       // marshal has called them to start line
    "marching",     // confirmed started the parade
    "completed",    // reached disbanding area
    "scratched",    // withdrew / did not participate
  ]).default("staged").notNull(),
  calledAt: timestamp("calledAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParadeUnit = typeof paradeUnits.$inferSelect;
export type InsertParadeUnit = typeof paradeUnits.$inferInsert;

// ─── Live Parade: Checkpoints along the route ────────────────────────────────
export const paradeCheckpoints = mysqlTable("parade_checkpoints", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),          // e.g. "Parade Start"
  shortName: varchar("shortName", { length: 64 }).notNull(), // e.g. "START"
  description: varchar("description", { length: 512 }),
  streetAddress: varchar("streetAddress", { length: 256 }),
  lat: varchar("lat", { length: 32 }),
  lng: varchar("lng", { length: 32 }),
  routeOrder: int("routeOrder").notNull(),                   // 1 = first on route
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParadeCheckpoint = typeof paradeCheckpoints.$inferSelect;
export type InsertParadeCheckpoint = typeof paradeCheckpoints.$inferInsert;

// ─── Live Parade: Checkpoint Logs (unit passes a checkpoint) ─────────────────
export const paradeCheckpointLogs = mysqlTable("parade_checkpoint_logs", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId").notNull(),
  checkpointId: int("checkpointId").notNull(),
  marshalName: varchar("marshalName", { length: 256 }),
  passedAt: timestamp("passedAt").defaultNow().notNull(),
  notes: text("notes"),
});

export type ParadeCheckpointLog = typeof paradeCheckpointLogs.$inferSelect;
export type InsertParadeCheckpointLog = typeof paradeCheckpointLogs.$inferInsert;

// ─── Live Parade: Session (controls the active parade day) ───────────────────
export const paradeSession = mysqlTable("parade_session", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull().unique(),
  status: mysqlEnum("status", ["setup", "staging", "active", "completed"]).default("setup").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  currentUnitId: int("currentUnitId"),   // the unit currently at the start line
  totalUnits: int("totalUnits").default(0),
  unitsCompleted: int("unitsCompleted").default(0),
  averageGapSeconds: int("averageGapSeconds").default(90), // seconds between units
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParadeSession = typeof paradeSession.$inferSelect;
export type InsertParadeSession = typeof paradeSession.$inferInsert;
