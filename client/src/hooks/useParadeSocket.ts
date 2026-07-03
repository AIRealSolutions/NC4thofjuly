/**
 * useParadeSocket — connects to the Socket.IO parade namespace and keeps
 * a live snapshot of the parade state in React state.
 *
 * Usage:
 *   const { state, connected, marshalConfirm, checkpointPass, unitStatus, sessionUpdate } = useParadeSocket(year);
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// ── Types mirrored from the server schema ────────────────────────────────────
export type UnitStatus = "staged" | "called" | "marching" | "completed" | "scratched";
export type SessionStatus = "setup" | "staging" | "active" | "completed";

export interface ParadeUnit {
  id: number;
  year: number;
  unitNumber: number;
  participantId: number | null;
  unitName: string;
  entryType: string;
  contactName: string | null;
  contactPhone: string | null;
  stagingZone: string | null;
  stagingSpot: string | null;
  status: UnitStatus;
  calledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParadeCheckpoint {
  id: number;
  name: string;
  shortName: string;
  description: string | null;
  streetAddress: string | null;
  lat: string | null;
  lng: string | null;
  routeOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CheckpointLog {
  id: number;
  unitId: number;
  checkpointId: number;
  marshalName: string | null;
  passedAt: string;
  notes: string | null;
}

export interface ParadeSessionData {
  id: number;
  year: number;
  status: SessionStatus;
  startedAt: string | null;
  completedAt: string | null;
  currentUnitId: number | null;
  totalUnits: number | null;
  unitsCompleted: number | null;
  averageGapSeconds: number | null;
  notes: string | null;
  lastResetAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParadeState {
  year: number;
  session: ParadeSessionData | null;
  units: ParadeUnit[];
  checkpoints: ParadeCheckpoint[];
  checkpointLogs: CheckpointLog[];
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useParadeSocket(year: number) {
  const [state, setState] = useState<ParadeState | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: "/api/parade-socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("parade:join", year);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("parade:state", (newState: ParadeState) => {
      setState(newState);
    });

    socket.on("parade:unit_updated", (unit: ParadeUnit) => {
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          units: prev.units.map((u) => (u.id === unit.id ? unit : u)),
        };
      });
    });

    socket.on("parade:checkpoint_log", (log: CheckpointLog) => {
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checkpointLogs: [...prev.checkpointLogs, log],
        };
      });
    });

    socket.on("parade:session_updated", (session: ParadeSessionData) => {
      setState((prev) => {
        if (!prev) return prev;
        return { ...prev, session };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [year]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const marshalConfirm = useCallback(
    (unitId: number, marshalName?: string) => {
      socketRef.current?.emit("parade:marshal_confirm", { unitId, year, marshalName });
    },
    [year]
  );

  const checkpointPass = useCallback(
    (unitId: number, checkpointId: number, marshalName?: string, notes?: string) => {
      socketRef.current?.emit("parade:checkpoint_pass", {
        unitId,
        checkpointId,
        year,
        marshalName,
        notes,
      });
    },
    [year]
  );

  const unitStatus = useCallback(
    (unitId: number, status: UnitStatus) => {
      socketRef.current?.emit("parade:unit_status", { unitId, year, status });
    },
    [year]
  );

  const sessionUpdate = useCallback(
    (data: { status?: SessionStatus; averageGapSeconds?: number; notes?: string }) => {
      socketRef.current?.emit("parade:session_update", { year, ...data });
    },
    [year]
  );

  return { state, connected, marshalConfirm, checkpointPass, unitStatus, sessionUpdate };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getStatusColor(status: UnitStatus): string {
  switch (status) {
    case "staged":    return "bg-slate-100 text-slate-700 border-slate-300";
    case "called":    return "bg-amber-100 text-amber-800 border-amber-400";
    case "marching":  return "bg-green-100 text-green-800 border-green-400";
    case "completed": return "bg-blue-100 text-blue-800 border-blue-400";
    case "scratched": return "bg-red-100 text-red-700 border-red-300";
    default:          return "bg-slate-100 text-slate-700 border-slate-300";
  }
}

export function getStatusLabel(status: UnitStatus): string {
  switch (status) {
    case "staged":    return "Staged";
    case "called":    return "Called";
    case "marching":  return "Marching";
    case "completed": return "Completed";
    case "scratched": return "Scratched";
    default:          return status;
  }
}

export function estimateCallTime(
  unit: ParadeUnit,
  units: ParadeUnit[],
  session: ParadeSessionData | null
): string | null {
  if (unit.status !== "staged") return null;
  const gap = session?.averageGapSeconds ?? 90;
  const marchingUnits = units.filter((u) => u.status === "marching" || u.status === "called");
  const lastMarchingNumber = marchingUnits.length > 0
    ? Math.max(...marchingUnits.map((u) => u.unitNumber))
    : 0;
  const unitsAhead = unit.unitNumber - lastMarchingNumber - 1;
  if (unitsAhead <= 0) return "Up next!";
  const secondsAhead = unitsAhead * gap;
  const minutes = Math.round(secondsAhead / 60);
  if (minutes < 1) return "Up next!";
  if (minutes === 1) return "~1 minute";
  return `~${minutes} minutes`;
}
