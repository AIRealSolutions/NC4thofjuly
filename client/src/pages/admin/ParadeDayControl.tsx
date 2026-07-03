/**
 * ParadeDayControl — Admin-only parade day management center.
 * - Set up / start / complete the parade session
 * - Import approved participants as units
 * - Reorder units, assign staging zones
 * - Override any unit status
 * - View live board
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  useParadeSocket,
  getStatusColor,
  getStatusLabel,
  type ParadeUnit,
  type UnitStatus,
} from "@/hooks/useParadeSocket";
import {
  Flag,
  Play,
  Square,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Wifi,
  WifiOff,
  Download,
  Settings,
  MapPin,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

const STAGING_ZONES = [
  "S Atlantic (Shriners)",
  "N Atlantic (Politicians)",
  "E Moore Left",
  "E Moore Right",
  "Rhett St Left",
  "Rhett St Right",
  "Other",
];

export default function ParadeDayControl() {
  const [year] = useState(CURRENT_YEAR);
  const { state, connected, unitStatus, sessionUpdate } = useParadeSocket(year);

  const session = state?.session;
  const units = state?.units ?? [];

  const [editUnit, setEditUnit] = useState<ParadeUnit | null>(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unitNumber: units.length + 1,
    unitName: "",
    entryType: "other",
    contactName: "",
    contactPhone: "",
    stagingZone: "",
    stagingSpot: "",
  });
  const [gapSeconds, setGapSeconds] = useState(
    String(session?.averageGapSeconds ?? 90)
  );

  const utils = trpc.useUtils();

  const upsertSession = trpc.paradeLive.upsertSession.useMutation({
    onSuccess: () => utils.paradeLive.session.invalidate({ year }),
  });

  // After any DB mutation, ask the socket server to re-broadcast full state
  // by emitting parade:join again (server always responds with parade:state)
  const refreshSocket = useCallback(() => {
    // The socket hook's internal socket will re-emit join on reconnect,
    // but we can force a state refresh by calling sessionUpdate with no changes
    // which triggers a full state broadcast from the server.
    sessionUpdate({});
  }, [sessionUpdate]);

  const createUnit = trpc.paradeLive.createUnit.useMutation({
    onSuccess: () => {
      toast.success("Unit added!");
      setShowAddUnit(false);
      setNewUnit({ unitNumber: units.length + 2, unitName: "", entryType: "other", contactName: "", contactPhone: "", stagingZone: "", stagingSpot: "" });
      setTimeout(refreshSocket, 300);
    },
  });

  const updateUnit = trpc.paradeLive.updateUnit.useMutation({
    onSuccess: () => {
      toast.success("Unit updated!");
      setEditUnit(null);
      setTimeout(refreshSocket, 300);
    },
  });

  const deleteUnit = trpc.paradeLive.deleteUnit.useMutation({
    onSuccess: () => {
      toast.success("Unit removed.");
      setTimeout(refreshSocket, 300);
    },
  });

  const [showResetDialog, setShowResetDialog] = useState(false);
  // Persist last reset time — read from session on load, update after reset
  const sessionLastReset = session?.lastResetAt
    ? new Date(session.lastResetAt).toLocaleTimeString()
    : null;
  const [localResetAt, setLocalResetAt] = useState<string | null>(null);
  const lastResetAt = localResetAt ?? sessionLastReset;

  const resetParade = trpc.paradeLive.reset.useMutation({
    onSuccess: (data) => {
      toast.success(`Parade reset! ${data.unitsReset} units restored to staged.`);
      setLocalResetAt(new Date(data.resetAt).toLocaleTimeString());
      setShowResetDialog(false);
      setTimeout(refreshSocket, 300);
    },
    onError: () => toast.error("Reset failed. Please try again."),
  });

  const bulkImport = trpc.paradeLive.bulkImportFromParticipants.useMutation({
    onSuccess: (data) => {
      toast.success(`Imported ${data.added} units from approved participants.`);
      setTimeout(refreshSocket, 300);
    },
    onError: () => toast.error("Import failed."),
  });

  const stats = {
    staged:    units.filter((u) => u.status === "staged").length,
    called:    units.filter((u) => u.status === "called").length,
    marching:  units.filter((u) => u.status === "marching").length,
    completed: units.filter((u) => u.status === "completed").length,
    scratched: units.filter((u) => u.status === "scratched").length,
    total:     units.filter((u) => u.status !== "scratched").length,
  };

  function handleSessionStatus(status: "setup" | "staging" | "active" | "completed") {
    upsertSession.mutate({ year, status });
    sessionUpdate({ status });
    toast.success(`Parade status set to: ${status}`);
  }

  function handleGapUpdate() {
    const val = parseInt(gapSeconds, 10);
    if (isNaN(val) || val < 10) { toast.error("Enter a valid gap (minimum 10 seconds)"); return; }
    upsertSession.mutate({ year, averageGapSeconds: val });
    sessionUpdate({ averageGapSeconds: val });
    toast.success(`Gap updated to ${val} seconds.`);
  }

  function handleUnitStatusOverride(unit: ParadeUnit, status: UnitStatus) {
    unitStatus(unit.id, status);
    toast.info(`Unit ${unit.unitNumber} set to ${status}.`);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Flag className="w-6 h-6 text-red-600" />
              Parade Day Control Center
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{year} NC 4th of July Parade · Live Management</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
              connected
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-red-50 border-red-300 text-red-700"
            }`}>
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {connected ? "Live Connected" : "Reconnecting…"}
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/parade/live" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Live Board
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/parade/marshal" target="_blank" rel="noopener noreferrer">
                <Flag className="w-3.5 h-3.5 mr-1.5" />
                Start Line
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset for Test
            </Button>
          </div>
        </div>

        {/* Last reset banner */}
        {lastResetAt && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>Parade reset at <strong>{lastResetAt}</strong> — all units back to Staged, session set to Setup. Ready for test run.</span>
          </div>
        )}

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                Reset Parade for Testing?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                This will:
              </p>
              <ul className="text-sm space-y-1.5 list-none">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Reset all <strong>{units.length} units</strong> back to <strong>Staged</strong></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Clear all checkpoint logs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Set session status back to <strong>Setup</strong></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Instantly update all connected Live Boards and Marshal pages</li>
              </ul>
              <p className="text-xs text-muted-foreground pt-1">
                Unit names and order are preserved. Only statuses and logs are cleared.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => resetParade.mutate({ year, confirm: true })}
                disabled={resetParade.isPending}
              >
                {resetParade.isPending ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Resetting…</>
                ) : (
                  <><RotateCcw className="w-4 h-4 mr-2" /> Yes, Reset Parade</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Session control */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              Parade Session Control
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(["setup", "staging", "active", "completed"] as const).map((s) => (
                <Button
                  key={s}
                  onClick={() => handleSessionStatus(s)}
                  variant={session?.status === s ? "default" : "outline"}
                  className={session?.status === s ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                  size="sm"
                >
                  {s === "setup" ? "⚙️ Setup" :
                   s === "staging" ? "🟡 Staging" :
                   s === "active" ? "🟢 Active" : "✅ Complete"}
                </Button>
              ))}
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Avg. Gap Between Units (seconds)</label>
                <Input
                  value={gapSeconds}
                  onChange={(e) => setGapSeconds(e.target.value)}
                  type="number"
                  min={10}
                  className="h-8"
                />
              </div>
              <Button size="sm" onClick={handleGapUpdate} className="mt-5">Update</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Live Stats
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Staged",    value: stats.staged,    color: "text-slate-600" },
                { label: "Called",    value: stats.called,    color: "text-amber-600" },
                { label: "Marching",  value: stats.marching,  color: "text-green-600" },
                { label: "Completed", value: stats.completed, color: "text-blue-600"  },
                { label: "Scratched", value: stats.scratched, color: "text-red-500"   },
                { label: "Total",     value: stats.total,     color: "text-foreground" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            {stats.total > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{stats.completed}/{stats.total}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Unit management */}
        <div className="border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Parade Units ({units.length})
            </h2>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkImport.mutate({ year })}
                disabled={bulkImport.isPending}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {bulkImport.isPending ? "Importing…" : "Import Approved Participants"}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddUnit(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Unit
              </Button>
            </div>
          </div>

          {/* Checkpoint links */}
          <div className="px-5 py-3 bg-muted/30 border-b flex items-center gap-2 flex-wrap text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs font-medium">Marshal Checkpoint Links:</span>
            {(state?.checkpoints ?? []).map((cp) => (
              <a
                key={cp.id}
                href={`/parade/checkpoint/${cp.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-background border rounded px-2 py-0.5 hover:bg-accent transition-colors"
              >
                {cp.shortName} — {cp.streetAddress}
              </a>
            ))}
            {(state?.checkpoints ?? []).length === 0 && (
              <span className="text-xs text-muted-foreground">No checkpoints seeded yet.</span>
            )}
          </div>

          {/* Unit table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2 text-left w-12">#</th>
                  <th className="px-4 py-2 text-left">Unit Name</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Staging Zone</th>
                  <th className="px-4 py-2 text-left">Contact</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No units yet. Import approved participants or add units manually.
                    </td>
                  </tr>
                ) : (
                  units.map((unit) => (
                    <tr key={unit.id} className={`hover:bg-muted/20 ${unit.status === "marching" ? "bg-green-50" : unit.status === "called" ? "bg-amber-50" : ""}`}>
                      <td className="px-4 py-2.5 font-bold tabular-nums text-muted-foreground">{unit.unitNumber}</td>
                      <td className="px-4 py-2.5 font-medium">{unit.unitName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground capitalize text-xs">{unit.entryType.replace("_", " ")}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {unit.stagingZone ?? "—"}
                        {unit.stagingSpot && <span className="ml-1 text-foreground font-medium">· {unit.stagingSpot}</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {unit.contactName ?? "—"}
                        {unit.contactPhone && <div className="text-[10px]">{unit.contactPhone}</div>}
                      </td>
                      <td className="px-4 py-2.5">
                        <Select
                          value={unit.status}
                          onValueChange={(val) => handleUnitStatusOverride(unit, val as UnitStatus)}
                        >
                          <SelectTrigger className={`h-7 text-xs w-28 border ${getStatusColor(unit.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["staged","called","marching","completed","scratched"] as UnitStatus[]).map((s) => (
                              <SelectItem key={s} value={s} className="text-xs capitalize">{getStatusLabel(s)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditUnit(unit)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            onClick={() => {
                              if (confirm(`Delete Unit ${unit.unitNumber} — ${unit.unitName}?`)) {
                                deleteUnit.mutate({ id: unit.id });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Unit Dialog */}
      <Dialog open={showAddUnit} onOpenChange={setShowAddUnit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Parade Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Unit Number *</label>
                <Input
                  type="number"
                  value={newUnit.unitNumber}
                  onChange={(e) => setNewUnit({ ...newUnit, unitNumber: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Entry Type</label>
                <Select value={newUnit.entryType} onValueChange={(v) => setNewUnit({ ...newUnit, entryType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["float","marching_band","vehicle","walking_group","equestrian","other"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Unit Name *</label>
              <Input value={newUnit.unitName} onChange={(e) => setNewUnit({ ...newUnit, unitName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Contact Name</label>
                <Input value={newUnit.contactName} onChange={(e) => setNewUnit({ ...newUnit, contactName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Contact Phone</label>
                <Input value={newUnit.contactPhone} onChange={(e) => setNewUnit({ ...newUnit, contactPhone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Staging Zone</label>
                <Select value={newUnit.stagingZone} onValueChange={(v) => setNewUnit({ ...newUnit, stagingZone: v })}>
                  <SelectTrigger><SelectValue placeholder="Select zone…" /></SelectTrigger>
                  <SelectContent>
                    {STAGING_ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Staging Spot (e.g. A1)</label>
                <Input value={newUnit.stagingSpot} onChange={(e) => setNewUnit({ ...newUnit, stagingSpot: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUnit(false)}>Cancel</Button>
            <Button
              onClick={() => createUnit.mutate({ year, ...newUnit })}
              disabled={!newUnit.unitName || createUnit.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {createUnit.isPending ? "Adding…" : "Add Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog */}
      {editUnit && (
        <Dialog open={!!editUnit} onOpenChange={() => setEditUnit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Unit #{editUnit.unitNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Unit Name</label>
                <Input
                  value={editUnit.unitName}
                  onChange={(e) => setEditUnit({ ...editUnit, unitName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Staging Zone</label>
                  <Select value={editUnit.stagingZone ?? ""} onValueChange={(v) => setEditUnit({ ...editUnit, stagingZone: v })}>
                    <SelectTrigger><SelectValue placeholder="Select zone…" /></SelectTrigger>
                    <SelectContent>
                      {STAGING_ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Staging Spot</label>
                  <Input
                    value={editUnit.stagingSpot ?? ""}
                    onChange={(e) => setEditUnit({ ...editUnit, stagingSpot: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                <Input
                  value={editUnit.notes ?? ""}
                  onChange={(e) => setEditUnit({ ...editUnit, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUnit(null)}>Cancel</Button>
              <Button
                onClick={() => updateUnit.mutate({
                  id: editUnit.id,
                  unitName: editUnit.unitName,
                  stagingZone: editUnit.stagingZone ?? undefined,
                  stagingSpot: editUnit.stagingSpot ?? undefined,
                  notes: editUnit.notes ?? undefined,
                })}
                disabled={updateUnit.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {updateUnit.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
