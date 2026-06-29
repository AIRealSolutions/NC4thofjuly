/**
 * MarshalStart — for the marshal at the START of the parade (E Moore & Atlantic Ave).
 * Shows the current unit, lets the marshal confirm it has started marching,
 * and shows the next several units in queue.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useParadeSocket,
  getStatusColor,
  getStatusLabel,
  estimateCallTime,
  type ParadeUnit,
} from "@/hooks/useParadeSocket";
import {
  Flag,
  CheckCircle2,
  ChevronRight,
  Radio,
  Wifi,
  WifiOff,
  Clock,
  Users,
  AlertTriangle,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

export default function MarshalStart() {
  const [year] = useState(CURRENT_YEAR);
  const [marshalName, setMarshalName] = useState(
    () => localStorage.getItem("marshalName") ?? ""
  );
  const [nameSet, setNameSet] = useState(() => !!localStorage.getItem("marshalName"));
  const [confirming, setConfirming] = useState<number | null>(null);

  const { state, connected, marshalConfirm, unitStatus } = useParadeSocket(year);

  const session = state?.session;
  const units = state?.units ?? [];

  // Current unit = the one that's "called" or the next staged
  const currentUnit =
    units.find((u) => u.status === "called") ??
    units.find((u) => u.status === "staged");

  // Next 5 staged units after current
  const upcomingUnits = units
    .filter((u) => u.status === "staged" && u.id !== currentUnit?.id)
    .slice(0, 5);

  // Recently started
  const recentlyStarted = units
    .filter((u) => u.status === "marching")
    .sort((a, b) => new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime())
    .slice(0, 3);

  function handleSetName() {
    if (!marshalName.trim()) return;
    localStorage.setItem("marshalName", marshalName.trim());
    setNameSet(true);
    toast.success(`Welcome, ${marshalName.trim()}!`);
  }

  async function handleConfirm(unit: ParadeUnit) {
    setConfirming(unit.id);
    try {
      marshalConfirm(unit.id, marshalName);
      toast.success(`Unit ${unit.unitNumber} — ${unit.unitName} confirmed marching!`);
    } catch {
      toast.error("Failed to confirm unit. Please try again.");
    } finally {
      setConfirming(null);
    }
  }

  async function handleCall(unit: ParadeUnit) {
    unitStatus(unit.id, "called");
    toast.info(`Unit ${unit.unitNumber} called to start line.`);
  }

  async function handleScratch(unit: ParadeUnit) {
    if (!confirm(`Mark Unit ${unit.unitNumber} — ${unit.unitName} as scratched?`)) return;
    unitStatus(unit.id, "scratched");
    toast.warning(`Unit ${unit.unitNumber} scratched.`);
  }

  // Name entry screen
  if (!nameSet) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm text-white text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto">
            <Flag className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Marshal — Start Line</h1>
            <p className="text-sm text-white/50 mt-1">Atlantic Ave & E Moore St — Parade heads WEST</p>
          </div>
          <p className="text-sm text-white/60">Enter your name to begin managing the parade start.</p>
          <Input
            value={marshalName}
            onChange={(e) => setMarshalName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetName()}
            placeholder="Your name…"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-center"
          />
          <Button
            onClick={handleSetName}
            disabled={!marshalName.trim()}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Start Managing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="bg-[#0d1428] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center">
            <Flag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold">Start Line Marshal</h1>
            <p className="text-xs text-white/40">Atlantic Ave & E Moore St · Parade heads WEST · {marshalName}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
          connected
            ? "bg-green-900/40 border-green-500/40 text-green-400"
            : "bg-red-900/40 border-red-500/40 text-red-400"
        }`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? "Live" : "Offline"}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Session status */}
        {session && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-semibold text-center ${
            session.status === "active"
              ? "bg-green-900/30 border-green-500/40 text-green-300"
              : session.status === "staging"
              ? "bg-amber-900/30 border-amber-500/40 text-amber-300"
              : "bg-slate-800 border-white/10 text-white/50"
          }`}>
            {session.status === "active" ? "🟢 Parade is ACTIVE" :
             session.status === "staging" ? "🟡 Staging — Parade not yet started" :
             session.status === "completed" ? "✅ Parade Complete" :
             "⚙️ Setup Mode"}
          </div>
        )}

        {/* Current unit — BIG CARD */}
        {currentUnit ? (
          <div className={`rounded-2xl border-2 p-6 space-y-4 ${
            currentUnit.status === "called"
              ? "bg-amber-900/30 border-amber-500"
              : "bg-white/5 border-white/20"
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">
                  {currentUnit.status === "called" ? "⚡ Called to Start Line" : "▶ Next Up"}
                </div>
                <div className="text-4xl font-black text-white tabular-nums">
                  #{currentUnit.unitNumber}
                </div>
                <div className="text-xl font-bold text-white mt-1">{currentUnit.unitName}</div>
                <div className="text-sm text-white/50 capitalize mt-0.5">
                  {currentUnit.entryType.replace("_", " ")}
                  {currentUnit.contactName && ` · ${currentUnit.contactName}`}
                  {currentUnit.contactPhone && ` · ${currentUnit.contactPhone}`}
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(currentUnit.status)}`}>
                {getStatusLabel(currentUnit.status)}
              </span>
            </div>

            {currentUnit.stagingZone && (
              <div className="text-sm text-white/50">
                📍 Staging: <span className="text-white/80">{currentUnit.stagingZone}{currentUnit.stagingSpot ? ` · Spot ${currentUnit.stagingSpot}` : ""}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap pt-1">
              {currentUnit.status === "staged" && (
                <Button
                  onClick={() => handleCall(currentUnit)}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold flex-1"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Call to Start Line
                </Button>
              )}
              {(currentUnit.status === "called" || currentUnit.status === "staged") && (
                <Button
                  onClick={() => handleConfirm(currentUnit)}
                  disabled={confirming === currentUnit.id}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {confirming === currentUnit.id ? "Confirming…" : "✓ Confirm Marching"}
                </Button>
              )}
              <Button
                onClick={() => handleScratch(currentUnit)}
                variant="outline"
                className="border-red-500/40 text-red-400 hover:bg-red-900/30 bg-transparent"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Scratch
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
            {units.length === 0
              ? "No units loaded. Waiting for parade data…"
              : "All units have marched! 🎉"}
          </div>
        )}

        {/* Upcoming units */}
        {upcomingUnits.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 text-sm font-semibold text-white/70">
              <Clock className="w-4 h-4" />
              Next Up
            </div>
            <div className="divide-y divide-white/5">
              {upcomingUnits.map((unit, idx) => {
                const eta = estimateCallTime(unit, units, session ?? null);
                return (
                  <div key={unit.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="text-2xl font-bold text-white/30 tabular-nums w-10 text-right">
                      {unit.unitNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white/80 truncate">{unit.unitName}</div>
                      <div className="text-xs text-white/30 capitalize">{unit.entryType.replace("_", " ")}</div>
                    </div>
                    {eta && <div className="text-xs text-white/40 flex-shrink-0">{eta}</div>}
                    <Button
                      size="sm"
                      onClick={() => handleCall(unit)}
                      variant="outline"
                      className="border-amber-500/40 text-amber-400 hover:bg-amber-900/30 bg-transparent text-xs"
                    >
                      Call
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently started */}
        {recentlyStarted.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 text-sm font-semibold text-white/70">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Recently Started
            </div>
            <div className="divide-y divide-white/5">
              {recentlyStarted.map((unit) => (
                <div key={unit.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="text-lg font-bold text-green-400 tabular-nums w-10 text-right">
                    {unit.unitNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white/70 truncate">{unit.unitName}</div>
                  </div>
                  <span className="text-xs text-green-400">● Marching</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View full board link */}
        <div className="text-center">
          <a href="/parade/live" className="text-sm text-white/30 hover:text-white/60 underline">
            View Full Parade Board →
          </a>
        </div>
      </div>
    </div>
  );
}
