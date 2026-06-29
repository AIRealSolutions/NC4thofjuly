/**
 * UnitTracker — for parade participants to look up their unit and see:
 *   - Their unit number and staging location
 *   - How many units are ahead of them
 *   - Estimated time until they're called
 *   - Live status updates
 *
 * URL: /parade/tracker  (they enter their unit number or name)
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useParadeSocket,
  getStatusColor,
  getStatusLabel,
  estimateCallTime,
  type ParadeUnit,
} from "@/hooks/useParadeSocket";
import {
  Flag,
  Search,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Activity,
  Wifi,
  WifiOff,
  ChevronUp,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

export default function UnitTracker() {
  const [year] = useState(CURRENT_YEAR);
  const [query, setQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<ParadeUnit | null>(null);

  const { state, connected } = useParadeSocket(year);

  const session = state?.session;
  const units = state?.units ?? [];
  const checkpoints = state?.checkpoints ?? [];
  const checkpointLogs = state?.checkpointLogs ?? [];

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return units
      .filter((u) =>
        u.unitName.toLowerCase().includes(q) ||
        String(u.unitNumber) === q.trim()
      )
      .slice(0, 8);
  }, [units, query]);

  // When a unit is selected, keep it updated from live state
  const liveUnit = selectedUnit
    ? units.find((u) => u.id === selectedUnit.id) ?? selectedUnit
    : null;

  // Units ahead in queue (staged, with lower unit number)
  const unitsAhead = liveUnit
    ? units.filter(
        (u) =>
          (u.status === "staged" || u.status === "called") &&
          u.unitNumber < liveUnit.unitNumber
      ).length
    : 0;

  // Checkpoint history for this unit
  const unitLogs = liveUnit
    ? checkpointLogs
        .filter((l) => l.unitId === liveUnit.id)
        .sort((a, b) => new Date(a.passedAt).getTime() - new Date(b.passedAt).getTime())
    : [];

  const eta = liveUnit ? estimateCallTime(liveUnit, units, session ?? null) : null;

  const marching  = units.filter((u) => u.status === "marching").length;
  const completed = units.filter((u) => u.status === "completed").length;
  const total     = units.filter((u) => u.status !== "scratched").length;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="bg-[#0d1428] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center">
            <Flag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold">Participant Unit Tracker</h1>
            <p className="text-xs text-white/40">NC 4th of July Parade · {year}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
          connected
            ? "bg-green-900/40 border-green-500/40 text-green-400"
            : "bg-red-900/40 border-red-500/40 text-red-400"
        }`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? "Live" : "Reconnecting…"}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Parade status bar */}
        {session && (
          <div className={`rounded-xl border px-4 py-2.5 text-sm font-semibold text-center ${
            session.status === "active"
              ? "bg-green-900/30 border-green-500/40 text-green-300"
              : session.status === "staging"
              ? "bg-amber-900/30 border-amber-500/40 text-amber-300"
              : "bg-slate-800 border-white/10 text-white/50"
          }`}>
            {session.status === "active"
              ? `🟢 Parade Active · ${marching} units marching · ${completed}/${total} complete`
              : session.status === "staging"
              ? "🟡 Staging — Parade starts soon"
              : session.status === "completed"
              ? "✅ Parade Complete"
              : "⚙️ Setup Mode"}
          </div>
        )}

        {/* Search */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Find Your Unit
          </label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your unit number or name…"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
          />
          {searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => { setSelectedUnit(unit); setQuery(""); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 transition-colors"
                >
                  <span className="text-xl font-bold text-white/50 tabular-nums w-10 text-right">
                    {unit.unitNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">{unit.unitName}</div>
                    <div className="text-xs text-white/30 capitalize">{unit.entryType.replace("_", " ")}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(unit.status)}`}>
                    {getStatusLabel(unit.status)}
                  </span>
                </button>
              ))}
            </div>
          )}
          {query && searchResults.length === 0 && units.length > 0 && (
            <p className="text-sm text-white/30 text-center py-2">No units found for "{query}"</p>
          )}
        </div>

        {/* Selected unit card */}
        {liveUnit && (
          <div className="space-y-4">
            {/* Main status card */}
            <div className={`rounded-2xl border-2 p-6 space-y-4 ${
              liveUnit.status === "called"    ? "bg-amber-900/30 border-amber-500" :
              liveUnit.status === "marching"  ? "bg-green-900/30 border-green-500" :
              liveUnit.status === "completed" ? "bg-blue-900/30 border-blue-500"  :
              liveUnit.status === "scratched" ? "bg-red-900/20 border-red-500/40" :
              "bg-white/5 border-white/20"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Unit</div>
                  <div className="text-5xl font-black tabular-nums text-white">#{liveUnit.unitNumber}</div>
                  <div className="text-xl font-bold text-white mt-1">{liveUnit.unitName}</div>
                  <div className="text-sm text-white/50 capitalize mt-0.5">
                    {liveUnit.entryType.replace("_", " ")}
                  </div>
                </div>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${getStatusColor(liveUnit.status)}`}>
                  {getStatusLabel(liveUnit.status)}
                </span>
              </div>

              {/* Staging info */}
              {liveUnit.stagingZone && liveUnit.status === "staged" && (
                <div className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                  <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <span className="text-white/70">
                    Staging Zone: <strong className="text-white">{liveUnit.stagingZone}</strong>
                    {liveUnit.stagingSpot && <span> · Spot <strong className="text-white">{liveUnit.stagingSpot}</strong></span>}
                  </span>
                </div>
              )}

              {/* Units ahead + ETA */}
              {liveUnit.status === "staged" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <ChevronUp className="w-5 h-5 mx-auto text-white/40 mb-1" />
                    <div className="text-2xl font-bold text-white">{unitsAhead}</div>
                    <div className="text-xs text-white/40">Units Ahead</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Clock className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                    <div className="text-lg font-bold text-amber-300">{eta ?? "—"}</div>
                    <div className="text-xs text-white/40">Est. Call Time</div>
                  </div>
                </div>
              )}

              {/* Active status messages */}
              {liveUnit.status === "called" && (
                <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-4 text-center">
                  <div className="text-amber-300 font-bold text-lg">⚡ You've been called!</div>
                  <div className="text-amber-200/70 text-sm mt-1">Please proceed to the start line at Atlantic Ave &amp; E Moore St.</div>
                </div>
              )}
              {liveUnit.status === "marching" && (
                <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 text-center">
                  <div className="text-green-300 font-bold text-lg">🎉 You're marching!</div>
                  <div className="text-green-200/70 text-sm mt-1">Enjoy the parade! Disband on Fodale Ave near the cemetery.</div>
                </div>
              )}
              {liveUnit.status === "completed" && (
                <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl p-4 text-center">
                  <div className="text-blue-300 font-bold text-lg">✅ Parade Complete!</div>
                  <div className="text-blue-200/70 text-sm mt-1">Thank you for participating in the NC 4th of July Parade!</div>
                </div>
              )}
            </div>

            {/* Checkpoint progress */}
            {checkpoints.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Route Progress
                </h3>
                <div className="space-y-2">
                  {checkpoints.map((cp) => {
                    const passed = unitLogs.some((l) => l.checkpointId === cp.id);
                    const passedLog = unitLogs.find((l) => l.checkpointId === cp.id);
                    return (
                      <div
                        key={cp.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                          passed
                            ? "bg-green-900/20 border-green-500/30"
                            : "bg-white/3 border-white/10"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          passed ? "bg-green-600" : "bg-white/10"
                        }`}>
                          {passed
                            ? <CheckCircle2 className="w-4 h-4 text-white" />
                            : <span className="text-xs text-white/40 font-bold">{cp.routeOrder}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold ${passed ? "text-green-300" : "text-white/50"}`}>
                            {cp.name}
                          </div>
                          <div className="text-xs text-white/30">{cp.streetAddress}</div>
                        </div>
                        {passed && passedLog && (
                          <div className="text-xs text-green-400">
                            {new Date(passedLog.passedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Units around them */}
            {liveUnit.status === "staged" && unitsAhead > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-white/70 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Units Ahead of You
                </div>
                <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                  {units
                    .filter((u) => (u.status === "staged" || u.status === "called") && u.unitNumber < liveUnit.unitNumber)
                    .sort((a, b) => b.unitNumber - a.unitNumber)
                    .slice(0, 5)
                    .map((unit) => (
                      <div key={unit.id} className="px-4 py-2.5 flex items-center gap-3">
                        <div className="text-base font-bold text-white/40 tabular-nums w-10 text-right">
                          {unit.unitNumber}
                        </div>
                        <div className="flex-1 text-sm text-white/60 truncate">{unit.unitName}</div>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${getStatusColor(unit.status)}`}>
                          {getStatusLabel(unit.status)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setSelectedUnit(null)}
              className="w-full border-white/20 text-white/50 hover:text-white bg-transparent"
            >
              Search for a Different Unit
            </Button>
          </div>
        )}

        {/* Instructions when no unit selected */}
        {!liveUnit && units.length > 0 && !query && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-3">
            <Flag className="w-10 h-10 mx-auto text-red-500/60" />
            <p className="text-white/50 text-sm">
              Search for your unit number or name above to see your live parade status, staging location, and estimated call time.
            </p>
            <div className="text-xs text-white/30 space-y-1">
              <p>Starts at Atlantic Ave &amp; E Moore St — heads WEST</p>
              <p>Moore St → Right on Howe St → Right on Fodale Ave</p>
              <p>Disbands on Fodale Ave near the cemetery</p>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-4 justify-center text-xs text-white/30 pb-4">
          <a href="/parade/live" className="hover:text-white/60 underline">Full Live Board</a>
          <a href="/parade" className="hover:text-white/60 underline">Parade Info</a>
        </div>
      </div>
    </div>
  );
}
