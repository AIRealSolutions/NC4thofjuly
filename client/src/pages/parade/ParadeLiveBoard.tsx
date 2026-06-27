/**
 * ParadeLiveBoard — public-facing real-time parade status board.
 * All marshals and participants can open this to see the live parade flow.
 * Auto-connects via Socket.IO and updates in real time.
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useParadeSocket,
  getStatusColor,
  getStatusLabel,
  estimateCallTime,
  type ParadeUnit,
} from "@/hooks/useParadeSocket";
import {
  Flag,
  Radio,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Activity,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

export default function ParadeLiveBoard() {
  const [year] = useState(CURRENT_YEAR);
  const [filter, setFilter] = useState<"all" | "active" | "upcoming">("all");
  const [search, setSearch] = useState("");

  const { state, connected } = useParadeSocket(year);

  const session = state?.session;
  const units = state?.units ?? [];
  const checkpoints = state?.checkpoints ?? [];
  const checkpointLogs = state?.checkpointLogs ?? [];

  // Stats
  const staged    = units.filter((u) => u.status === "staged").length;
  const called    = units.filter((u) => u.status === "called").length;
  const marching  = units.filter((u) => u.status === "marching").length;
  const completed = units.filter((u) => u.status === "completed").length;
  const total     = units.filter((u) => u.status !== "scratched").length;

  // Filtered units
  const filteredUnits = units.filter((u) => {
    if (u.status === "scratched") return false;
    if (filter === "active" && u.status !== "marching" && u.status !== "called") return false;
    if (filter === "upcoming" && u.status !== "staged") return false;
    if (search && !u.unitName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Get latest checkpoint for a unit
  function getLatestCheckpoint(unitId: number) {
    const logs = checkpointLogs.filter((l) => l.unitId === unitId);
    if (logs.length === 0) return null;
    const latest = logs.reduce((a, b) =>
      new Date(a.passedAt) > new Date(b.passedAt) ? a : b
    );
    return checkpoints.find((c) => c.id === latest.checkpointId) ?? null;
  }

  const sessionStatusColor =
    session?.status === "active"    ? "bg-green-500" :
    session?.status === "staging"   ? "bg-amber-500" :
    session?.status === "completed" ? "bg-blue-500"  : "bg-slate-400";

  const sessionStatusLabel =
    session?.status === "active"    ? "PARADE IN PROGRESS" :
    session?.status === "staging"   ? "STAGING — PARADE NOT YET STARTED" :
    session?.status === "completed" ? "PARADE COMPLETE" :
    session?.status === "setup"     ? "SETUP MODE" : "AWAITING START";

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans">
      {/* Header */}
      <div className="bg-[#0d1428] border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">NC 4th of July Parade</h1>
              <p className="text-xs text-white/50">Live Parade Management Board · {year}</p>
            </div>
          </div>

          {/* Connection status */}
          <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${
            connected
              ? "bg-green-900/40 border-green-500/40 text-green-400"
              : "bg-red-900/40 border-red-500/40 text-red-400"
          }`}>
            {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{connected ? "Live" : "Reconnecting…"}</span>
          </div>
        </div>
      </div>

      {/* Session status banner */}
      <div className={`${sessionStatusColor} text-white text-center py-2 text-sm font-bold tracking-widest`}>
        <Activity className="w-4 h-4 inline mr-2 mb-0.5" />
        {sessionStatusLabel}
        {session?.averageGapSeconds && session.status === "active" && (
          <span className="ml-3 font-normal opacity-80">
            · ~{session.averageGapSeconds}s between units
          </span>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Staged",    value: staged,    icon: Clock,        color: "text-slate-300" },
            { label: "Called",    value: called,    icon: Radio,        color: "text-amber-400" },
            { label: "Marching",  value: marching,  icon: Activity,     color: "text-green-400" },
            { label: "Completed", value: completed, icon: CheckCircle2, color: "text-blue-400"  },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-white/50 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>Parade Progress</span>
              <span>{completed} of {total} units completed</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Route checkpoints */}
        {checkpoints.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Parade Route Checkpoints
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {checkpoints.map((cp, idx) => {
                const passCount = checkpointLogs.filter((l) => l.checkpointId === cp.id).length;
                return (
                  <div key={cp.id} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 min-w-[80px]">
                        <div className="text-xs font-bold text-white">{cp.shortName}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">{cp.streetAddress}</div>
                        <div className="text-xs text-green-400 font-semibold mt-1">{passCount} passed</div>
                      </div>
                    </div>
                    {idx < checkpoints.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Unit list */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 flex-wrap">
            <Users className="w-4 h-4 text-white/50" />
            <span className="text-sm font-semibold text-white/80">Parade Units</span>
            <div className="flex gap-2 ml-auto flex-wrap">
              {(["all", "active", "upcoming"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  className={filter === f ? "bg-red-600 hover:bg-red-700 text-white border-0" : "border-white/20 text-white/60 hover:text-white bg-transparent"}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f === "active" ? "Active" : "Upcoming"}
                </Button>
              ))}
              <Input
                placeholder="Search unit…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 h-8 bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm"
              />
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_8rem_10rem_8rem] gap-3 px-4 py-2 text-xs text-white/40 font-semibold uppercase tracking-wider border-b border-white/5">
            <span>#</span>
            <span>Unit Name</span>
            <span>Status</span>
            <span>Location</span>
            <span>Est. Call</span>
          </div>

          {/* Unit rows */}
          <div className="divide-y divide-white/5 max-h-[50vh] overflow-y-auto">
            {filteredUnits.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">
                {units.length === 0 ? "No units loaded yet — waiting for parade data…" : "No units match your filter."}
              </div>
            ) : (
              filteredUnits.map((unit) => {
                const latestCp = getLatestCheckpoint(unit.id);
                const eta = estimateCallTime(unit, units, session ?? null);
                return (
                  <UnitRow
                    key={unit.id}
                    unit={unit}
                    latestCheckpoint={latestCp?.shortName ?? null}
                    eta={eta}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 pb-4">
          NC 4th of July Festival · Southport, NC · P.O. Box 11247, Southport NC 28461
        </p>
      </div>
    </div>
  );
}

function UnitRow({
  unit,
  latestCheckpoint,
  eta,
}: {
  unit: ParadeUnit;
  latestCheckpoint: string | null;
  eta: string | null;
}) {
  const isActive = unit.status === "marching" || unit.status === "called";

  return (
    <div
      className={`grid grid-cols-[3rem_1fr_8rem_10rem_8rem] gap-3 px-4 py-3 items-center transition-colors ${
        isActive ? "bg-green-900/20" : ""
      }`}
    >
      {/* Unit number */}
      <div className={`text-lg font-bold tabular-nums ${isActive ? "text-green-400" : "text-white/40"}`}>
        {unit.unitNumber}
      </div>

      {/* Name + type */}
      <div>
        <div className={`font-semibold text-sm ${isActive ? "text-white" : "text-white/80"}`}>
          {unit.unitName}
        </div>
        <div className="text-xs text-white/30 capitalize">{unit.entryType.replace("_", " ")}</div>
      </div>

      {/* Status badge */}
      <div>
        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(unit.status)}`}>
          {getStatusLabel(unit.status)}
        </span>
      </div>

      {/* Last checkpoint */}
      <div className="text-xs text-white/40">
        {unit.status === "staged" && unit.stagingZone ? (
          <span className="text-white/50">📍 {unit.stagingZone}{unit.stagingSpot ? ` · ${unit.stagingSpot}` : ""}</span>
        ) : latestCheckpoint ? (
          <span className="text-blue-400">✓ Past {latestCheckpoint}</span>
        ) : unit.status === "marching" ? (
          <span className="text-green-400">At start line</span>
        ) : (
          <span>—</span>
        )}
      </div>

      {/* ETA */}
      <div className="text-xs">
        {unit.status === "marching" ? (
          <span className="text-green-400 font-semibold animate-pulse">● Marching</span>
        ) : unit.status === "called" ? (
          <span className="text-amber-400 font-semibold">● Called</span>
        ) : unit.status === "completed" ? (
          <span className="text-blue-400">Done</span>
        ) : eta ? (
          <span className="text-white/50">{eta}</span>
        ) : (
          <span className="text-white/20">—</span>
        )}
      </div>
    </div>
  );
}
