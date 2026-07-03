/**
 * Live Parade Manager — Socket.IO server
 *
 * Events emitted TO clients:
 *   parade:state          — full parade state snapshot (units, session, checkpoints)
 *   parade:unit_updated   — a single unit's status changed
 *   parade:checkpoint_log — a unit passed a checkpoint
 *   parade:session_updated — session status changed
 *
 * Events received FROM clients:
 *   parade:join           — join the parade room for a given year
 *   parade:marshal_confirm — marshal confirms unit has started marching
 *   parade:checkpoint_pass — marshal at a checkpoint logs a unit passing
 *   parade:unit_status    — admin updates a unit's status directly
 *   parade:session_update — admin updates the session (start, complete, etc.)
 */

import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { getDb } from "./db";
import {
  paradeUnits,
  paradeCheckpoints,
  paradeCheckpointLogs,
  paradeSession,
} from "../drizzle/schema";
import { eq, asc } from "drizzle-orm";

let io: SocketIOServer | null = null;

export function initParadeSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/parade-socket",
  });

  io.on("connection", (socket) => {
    console.log(`[ParadeSocket] Client connected: ${socket.id}`);

    // ── Join a parade year room ──────────────────────────────────────────────
    socket.on("parade:join", async (year: number) => {
      const room = `parade:${year}`;
      socket.join(room);
      console.log(`[ParadeSocket] ${socket.id} joined ${room}`);

      // Send full state snapshot to the joining client
      const state = await getParadeState(year);
      socket.emit("parade:state", state);
    });

    // ── Marshal confirms a unit has started marching ─────────────────────────
    socket.on(
      "parade:marshal_confirm",
      async (payload: { unitId: number; year: number; marshalName?: string }) => {
        const db = await getDb();
        if (!db) return;

        const now = new Date();
        await db
          .update(paradeUnits)
          .set({ status: "marching", startedAt: now, updatedAt: now })
          .where(eq(paradeUnits.id, payload.unitId));

        // Update session: advance currentUnit to next staged unit
        const allUnits = await db
          .select()
          .from(paradeUnits)
          .where(eq(paradeUnits.year, payload.year))
          .orderBy(asc(paradeUnits.unitNumber));

        const nextStaged = allUnits.find((u) => u.status === "staged" || u.status === "called");
        if (nextStaged) {
          await db
            .update(paradeSession)
            .set({ currentUnitId: nextStaged.id, updatedAt: now })
            .where(eq(paradeSession.year, payload.year));
        }

        const updated = allUnits.find((u) => u.id === payload.unitId);
        const room = `parade:${payload.year}`;
        io?.to(room).emit("parade:unit_updated", updated);

        // Broadcast full state so all boards refresh
        const state = await getParadeState(payload.year);
        io?.to(room).emit("parade:state", state);
      }
    );

    // ── Marshal at a checkpoint logs a unit passing ──────────────────────────
    socket.on(
      "parade:checkpoint_pass",
      async (payload: {
        unitId: number;
        checkpointId: number;
        year: number;
        marshalName?: string;
        notes?: string;
      }) => {
        const db = await getDb();
        if (!db) return;

        const now = new Date();

        // Insert checkpoint log
        await db.insert(paradeCheckpointLogs).values({
          unitId: payload.unitId,
          checkpointId: payload.checkpointId,
          marshalName: payload.marshalName ?? "Marshal",
          passedAt: now,
          notes: payload.notes ?? null,
        });

        // If this is the final checkpoint (disbanding), mark unit completed
        const checkpoints = await db
          .select()
          .from(paradeCheckpoints)
          .orderBy(asc(paradeCheckpoints.routeOrder));

        const maxOrder = Math.max(...checkpoints.map((c) => c.routeOrder));
        const thisCheckpoint = checkpoints.find((c) => c.id === payload.checkpointId);

        if (thisCheckpoint && thisCheckpoint.routeOrder === maxOrder) {
          await db
            .update(paradeUnits)
            .set({ status: "completed", completedAt: now, updatedAt: now })
            .where(eq(paradeUnits.id, payload.unitId));

          // Increment unitsCompleted on session
          const sessions = await db
            .select()
            .from(paradeSession)
            .where(eq(paradeSession.year, payload.year))
            .limit(1);

          if (sessions[0]) {
            await db
              .update(paradeSession)
              .set({
                unitsCompleted: (sessions[0].unitsCompleted ?? 0) + 1,
                updatedAt: now,
              })
              .where(eq(paradeSession.year, payload.year));
          }
        }

        const room = `parade:${payload.year}`;
        io?.to(room).emit("parade:checkpoint_log", {
          unitId: payload.unitId,
          checkpointId: payload.checkpointId,
          marshalName: payload.marshalName,
          passedAt: now.toISOString(),
        });

        const state = await getParadeState(payload.year);
        io?.to(room).emit("parade:state", state);
      }
    );

    // ── Admin updates a unit status directly ────────────────────────────────
    socket.on(
      "parade:unit_status",
      async (payload: {
        unitId: number;
        year: number;
        status: "staged" | "called" | "marching" | "completed" | "scratched";
      }) => {
        const db = await getDb();
        if (!db) return;

        const now = new Date();
        const unitUpdate: Partial<typeof paradeUnits.$inferInsert> & { updatedAt: Date } = {
          status: payload.status,
          updatedAt: now,
        };
        if (payload.status === "called") unitUpdate.calledAt = now;
        if (payload.status === "marching") unitUpdate.startedAt = now;
        if (payload.status === "completed") unitUpdate.completedAt = now;

        await db
          .update(paradeUnits)
          .set(unitUpdate)
          .where(eq(paradeUnits.id, payload.unitId));

        const room = `parade:${payload.year}`;
        const state = await getParadeState(payload.year);
        io?.to(room).emit("parade:state", state);
      }
    );

    // ── Admin updates session status ─────────────────────────────────────────
    socket.on(
      "parade:session_update",
      async (payload: {
        year: number;
        status?: "setup" | "staging" | "active" | "completed";
        averageGapSeconds?: number;
        notes?: string;
      }) => {
        const db = await getDb();
        if (!db) return;

        const now = new Date();
        const sessionUpdate: Partial<typeof paradeSession.$inferInsert> & { updatedAt: Date } = {
          updatedAt: now,
        };
        if (payload.status) {
          sessionUpdate.status = payload.status;
          if (payload.status === "active") sessionUpdate.startedAt = now;
          if (payload.status === "completed") sessionUpdate.completedAt = now;
        }
        if (payload.averageGapSeconds !== undefined)
          sessionUpdate.averageGapSeconds = payload.averageGapSeconds;
        if (payload.notes !== undefined) sessionUpdate.notes = payload.notes;

        await db
          .update(paradeSession)
          .set(sessionUpdate)
          .where(eq(paradeSession.year, payload.year));

        const room = `parade:${payload.year}`;
        const state = await getParadeState(payload.year);
        io?.to(room).emit("parade:state", state);
      }
    );

    socket.on("disconnect", () => {
      console.log(`[ParadeSocket] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[ParadeSocket] Socket.IO initialized on /api/parade-socket");
  return io;
}

// ── Full state snapshot ────────────────────────────────────────────────────────
export async function getParadeState(year: number) {
  const db = await getDb();
  if (!db) return { year, session: null, units: [], checkpoints: [], checkpointLogs: [] };

  const [units, checkpoints, sessions] = await Promise.all([
    db
      .select()
      .from(paradeUnits)
      .where(eq(paradeUnits.year, year))
      .orderBy(asc(paradeUnits.unitNumber)),
    db
      .select()
      .from(paradeCheckpoints)
      .where(eq(paradeCheckpoints.isActive, true))
      .orderBy(asc(paradeCheckpoints.routeOrder)),
    db.select().from(paradeSession).where(eq(paradeSession.year, year)).limit(1),
  ]);

  // Get recent checkpoint logs for this year's units
  const unitIds = units.map((u) => u.id);
  let checkpointLogs: typeof paradeCheckpointLogs.$inferSelect[] = [];
  if (unitIds.length > 0) {
    checkpointLogs = await db
      .select()
      .from(paradeCheckpointLogs)
      .orderBy(asc(paradeCheckpointLogs.passedAt));
  }

  return {
    year,
    session: sessions[0] ?? null,
    units,
    checkpoints,
    checkpointLogs,
  };
}

export function getSocketIO() {
  return io;
}

// Broadcast a full reset to all clients in the parade room
export async function broadcastParadeReset(year: number) {
  if (!io) return;
  const state = await getParadeState(year);
  io.to(`parade:${year}`).emit("parade:state", state);
  io.to(`parade:${year}`).emit("parade:reset", { year, timestamp: Date.now() });
}
