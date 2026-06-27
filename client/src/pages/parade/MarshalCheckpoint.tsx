/**
 * MarshalCheckpoint — for marshals stationed along the parade route.
 * They tap a unit number when it passes their location.
 * URL: /parade/checkpoint/:checkpointId
 */

import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useParadeSocket,
  type ParadeUnit,
} from "@/hooks/useParadeSocket";
import {
  MapPin,
  CheckCircle2,
  Wifi,
  WifiOff,
  Clock,
  Search,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

export default function MarshalCheckpoint() {
  const params = useParams<{ checkpointId: string }>();
  const checkpointId = parseInt(params.checkpointId ?? "1", 10);

  const [year] = useState(CURRENT_YEAR);
  const [marshalName, setMarshalName] = useState(
    () => localStorage.getItem("marshalName") ?? ""
  );
  const [nameSet, setNameSet] = useState(() => !!localStorage.getItem("marshalName"));
  const [search, setSearch] = useState("");
  const [logging, setLogging] = useState<number | null>(null);

  const { state, connected, checkpointPass } = useParadeSocket(year);

  const checkpoint = state?.checkpoints.find((c) => c.id === checkpointId);
  const units = state?.units ?? [];
  const checkpointLogs = state?.checkpointLogs ?? [];

  // Units that have already passed THIS checkpoint
  const passedIds = new Set(
    checkpointLogs.filter((l) => l.checkpointId === checkpointId).map((l) => l.unitId)
  );

  // Active / marching units that haven't passed this checkpoint yet
  const pendingUnits = useMemo(() =>
    units
      .filter((u) =>
        (u.status === "marching" || u.status === "called") &&
        !passedIds.has(u.id)
      )
      .sort((a, b) => a.unitNumber - b.unitNumber),
    [units, passedIds]
  );

  // All units for manual search
  const searchedUnits = useMemo(() =>
    units
      .filter((u) => u.status !== "scratched")
      .filter((u) =>
        search
          ? u.unitName.toLowerCase().includes(search.toLowerCase()) ||
            String(u.unitNumber).includes(search)
          : true
      )
      .sort((a, b) => a.unitNumber - b.unitNumber),
    [units, search]
  );

  // Recent passes at this checkpoint
  const recentPasses = checkpointLogs
    .filter((l) => l.checkpointId === checkpointId)
    .sort((a, b) => new Date(b.passedAt).getTime() - new Date(a.passedAt).getTime())
    .slice(0, 5);

  function handleSetName() {
    if (!marshalName.trim()) return;
    localStorage.setItem("marshalName", marshalName.trim());
    setNameSet(true);
    toast.success(`Welcome, ${marshalName.trim()}!`);
  }

  async function handlePass(unit: ParadeUnit) {
    setLogging(unit.id);
    try {
      checkpointPass(unit.id, checkpointId, marshalName);
      toast.success(`Unit ${unit.unitNumber} — ${unit.unitName} logged at ${checkpoint?.shortName ?? "checkpoint"}!`);
    } catch {
      toast.error("Failed to log unit. Please try again.");
    } finally {
      setLogging(null);
    }
  }

  // Name entry screen
  if (!nameSet) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm text-white text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Checkpoint Marshal</h1>
            <p className="text-sm text-white/50 mt-1">
              {checkpoint ? `${checkpoint.name} · ${checkpoint.streetAddress}` : `Checkpoint #${checkpointId}`}
            </p>
          </div>
          <p className="text-sm text-white/60">Enter your name to begin logging units at this checkpoint.</p>
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Logging
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
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold">
              {checkpoint ? checkpoint.name : `Checkpoint #${checkpointId}`}
            </h1>
            <p className="text-xs text-white/40">
              {checkpoint?.streetAddress ?? "Loading…"} · {marshalName}
            </p>
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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{passedIds.size}</div>
            <div className="text-xs text-white/40 mt-0.5">Passed</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{pendingUnits.length}</div>
            <div className="text-xs text-white/40 mt-0.5">En Route</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white/50">{units.filter(u => u.status !== "scratched").length}</div>
            <div className="text-xs text-white/40 mt-0.5">Total Units</div>
          </div>
        </div>

        {/* Units en route — tap to log */}
        {pendingUnits.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Units En Route — Tap when they pass you
            </div>
            <div className="divide-y divide-white/5">
              {pendingUnits.map((unit) => (
                <div key={unit.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="text-xl font-bold text-amber-400 tabular-nums w-10 text-right">
                    {unit.unitNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">{unit.unitName}</div>
                    <div className="text-xs text-white/30 capitalize">{unit.entryType.replace("_", " ")}</div>
                  </div>
                  <Button
                    onClick={() => handlePass(unit)}
                    disabled={logging === unit.id || passedIds.has(unit.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold min-w-[90px]"
                  >
                    {logging === unit.id ? "Logging…" : passedIds.has(unit.id) ? "✓ Logged" : "✓ Passed"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual search — for units not showing as marching yet */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-white/70 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Any Unit
          </div>
          <div className="p-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by unit number or name…"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
            />
          </div>
          {search && (
            <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
              {searchedUnits.length === 0 ? (
                <div className="px-4 py-4 text-sm text-white/30 text-center">No units found.</div>
              ) : (
                searchedUnits.map((unit) => (
                  <div key={unit.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="text-lg font-bold text-white/40 tabular-nums w-10 text-right">
                      {unit.unitNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white/80 truncate">{unit.unitName}</div>
                      <div className="text-xs text-white/30 capitalize">{unit.status}</div>
                    </div>
                    <Button
                      onClick={() => handlePass(unit)}
                      disabled={logging === unit.id || passedIds.has(unit.id)}
                      size="sm"
                      className={passedIds.has(unit.id)
                        ? "bg-green-900/40 text-green-400 border border-green-500/40"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    >
                      {passedIds.has(unit.id) ? "✓ Logged" : "Log Pass"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Recent passes */}
        {recentPasses.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-white/70 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Recent Passes at This Checkpoint
            </div>
            <div className="divide-y divide-white/5">
              {recentPasses.map((log) => {
                const unit = units.find((u) => u.id === log.unitId);
                return (
                  <div key={log.id} className="px-4 py-2.5 flex items-center gap-3">
                    <div className="text-lg font-bold text-green-400 tabular-nums w-10 text-right">
                      {unit?.unitNumber ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white/70 truncate">{unit?.unitName ?? `Unit #${log.unitId}`}</div>
                    </div>
                    <div className="text-xs text-white/30">
                      {new Date(log.passedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-4 justify-center text-xs text-white/30">
          <a href="/parade/live" className="hover:text-white/60 underline">Full Board</a>
          <a href="/parade/marshal" className="hover:text-white/60 underline">Start Line</a>
        </div>
      </div>
    </div>
  );
}
