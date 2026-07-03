/**
 * StagingMarshal — PIN-gated portal for staging area marshals.
 * URL: /parade/staging/:zone  (zone is URL-encoded, e.g. "S%20Atlantic%20(Shriners)")
 *
 * Staging marshals can:
 *  - View all units assigned to their staging zone
 *  - Mark units as No-Show (scratched)
 *  - Restore a unit back to Staged
 *  - Add a walk-up / late entry that wasn't in the original lineup
 */

import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  type ParadeUnit,
} from "@/hooks/useParadeSocket";
import MarshalPinGate from "@/components/MarshalPinGate";
import {
  MapPin,
  UserX,
  UserCheck,
  Plus,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  ClipboardList,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

// Human-readable zone labels
const ZONE_LABELS: Record<string, { label: string; color: string; description: string }> = {
  "S Atlantic (Shriners)": {
    label: "S. Atlantic — Shriners",
    color: "bg-purple-600",
    description: "Shriners staging area on S. Atlantic Ave",
  },
  "N Atlantic (Politicians)": {
    label: "N. Atlantic — Politicians",
    color: "bg-blue-600",
    description: "Politicians & dignitaries staging on N. Atlantic Ave",
  },
  "E Moore Left": {
    label: "E. Moore St — Left Lane",
    color: "bg-green-600",
    description: "Left lane of E. Moore St staging area",
  },
  "E Moore Right": {
    label: "E. Moore St — Right Lane",
    color: "bg-emerald-600",
    description: "Right lane of E. Moore St staging area",
  },
  "Rhett St Left": {
    label: "Rhett St — Left Lane",
    color: "bg-amber-600",
    description: "Left lane of Rhett St staging overflow",
  },
  "Rhett St Right": {
    label: "Rhett St — Right Lane",
    color: "bg-orange-600",
    description: "Right lane of Rhett St staging overflow",
  },
};

export default function StagingMarshal() {
  const params = useParams<{ zone: string }>();
  const zone = decodeURIComponent(params.zone ?? "");

  return (
    <MarshalPinGate year={CURRENT_YEAR} stagingZone={zone}>
      {() => <StagingMarshalInner zone={zone} />}
    </MarshalPinGate>
  );
}

function StagingMarshalInner({ zone }: { zone: string }) {
  const [year] = useState(CURRENT_YEAR);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [confirmScratch, setConfirmScratch] = useState<ParadeUnit | null>(null);
  const [newEntry, setNewEntry] = useState({
    unitName: "",
    entryType: "other",
    contactName: "",
    contactPhone: "",
    stagingSpot: "",
    notes: "",
  });

  const { state, connected, unitStatus } = useParadeSocket(year);
  const utils = trpc.useUtils();

  // tRPC fallback for immediate load
  const { data: fallbackState } = trpc.paradeLive.state.useQuery(
    { year },
    { refetchOnWindowFocus: false }
  );

  const units = (state?.units ?? fallbackState?.units ?? []) as ParadeUnit[];
  const session = state?.session ?? fallbackState?.session ?? null;

  // Units in this staging zone
  const zoneUnits = useMemo(() =>
    units
      .filter((u) => u.stagingZone === zone)
      .sort((a, b) => a.unitNumber - b.unitNumber),
    [units, zone]
  );

  // Filtered by search
  const filteredUnits = useMemo(() =>
    zoneUnits.filter((u) =>
      search
        ? u.unitName.toLowerCase().includes(search.toLowerCase()) ||
          String(u.unitNumber).includes(search) ||
          (u.contactName ?? "").toLowerCase().includes(search.toLowerCase())
        : true
    ),
    [zoneUnits, search]
  );

  const staged = zoneUnits.filter((u) => u.status === "staged").length;
  const scratched = zoneUnits.filter((u) => u.status === "scratched").length;
  const marching = zoneUnits.filter((u) => u.status === "marching" || u.status === "called" || u.status === "completed").length;

  const zoneInfo = ZONE_LABELS[zone] ?? {
    label: zone,
    color: "bg-navy-600",
    description: "Staging zone",
  };

  // Add walk-up entry mutation
  const createUnit = trpc.paradeLive.stagingAddUnit.useMutation({
    onSuccess: () => {
      toast.success("Walk-up entry added to lineup!");
      setShowAddDialog(false);
      setNewEntry({ unitName: "", entryType: "other", contactName: "", contactPhone: "", stagingSpot: "", notes: "" });
      utils.paradeLive.state.invalidate({ year });
    },
    onError: (e) => toast.error(e.message),
  });

  function handleMarkNoShow(unit: ParadeUnit) {
    unitStatus(unit.id, "scratched");
    toast.success(`Unit ${unit.unitNumber} — ${unit.unitName} marked as No-Show.`);
    setConfirmScratch(null);
  }

  function handleMarkPresent(unit: ParadeUnit) {
    unitStatus(unit.id, "staged");
    toast.success(`Unit ${unit.unitNumber} — ${unit.unitName} restored to Staged.`);
  }

  function handleAddEntry() {
    if (!newEntry.unitName.trim()) { toast.error("Entry name is required"); return; }
    // Get next unit number
    const maxNum = units.length > 0 ? Math.max(...units.map((u) => u.unitNumber)) : 0;
    createUnit.mutate({
      year,
      unitNumber: maxNum + 1,
      unitName: newEntry.unitName.trim(),
      entryType: newEntry.entryType,
      contactName: newEntry.contactName.trim() || undefined,
      contactPhone: newEntry.contactPhone.trim() || undefined,
      stagingZone: zone,
      stagingSpot: newEntry.stagingSpot.trim() || undefined,
      notes: newEntry.notes.trim() || undefined,
    });
  }

  function getStatusBadge(unit: ParadeUnit) {
    switch (unit.status) {
      case "staged":    return <Badge className="bg-blue-100 text-blue-800 text-xs">Staged</Badge>;
      case "called":    return <Badge className="bg-amber-100 text-amber-800 text-xs">Called</Badge>;
      case "marching":  return <Badge className="bg-green-100 text-green-800 text-xs">Marching</Badge>;
      case "completed": return <Badge className="bg-gray-100 text-gray-600 text-xs">Completed</Badge>;
      case "scratched": return <Badge className="bg-red-100 text-red-800 text-xs">No-Show</Badge>;
      default:          return <Badge variant="secondary" className="text-xs">{unit.status}</Badge>;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="bg-[#0d1428] border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${zoneInfo.color} flex items-center justify-center`}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">{zoneInfo.label}</h1>
              <p className="text-xs text-white/40">{zoneInfo.description} · Staging Marshal</p>
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
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Session status banner */}
        {session && session.status === "setup" && (
          <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Parade is in <strong>Setup</strong> mode. Staging is not yet active.</span>
          </div>
        )}
        {session && session.status === "staging" && (
          <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded-xl px-4 py-3 text-blue-300 text-sm">
            <ClipboardList className="w-4 h-4 flex-shrink-0" />
            <span>Staging is <strong>Active</strong> — verify units and mark any no-shows.</span>
          </div>
        )}
        {session && session.status === "active" && (
          <div className="flex items-center gap-2 bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-3 text-green-300 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Parade is <strong>Active</strong> — units are stepping off.</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{zoneUnits.length}</div>
            <div className="text-xs text-white/40 mt-0.5">Total</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{staged}</div>
            <div className="text-xs text-white/40 mt-0.5">Staged</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{marching}</div>
            <div className="text-xs text-white/40 mt-0.5">Marching</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{scratched}</div>
            <div className="text-xs text-white/40 mt-0.5">No-Shows</div>
          </div>
        </div>

        {/* Search + Add Walk-up */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search unit name or number…"
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/30"
            />
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold gap-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Walk-Up
          </Button>
        </div>

        {/* Units list */}
        {filteredUnits.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl py-12 text-center">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">
              {search ? "No units match your search." : `No units assigned to ${zoneInfo.label} yet.`}
            </p>
            {!search && (
              <p className="text-white/25 text-xs mt-1">Units are assigned in the Admin Parade Day Control.</p>
            )}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-white/70 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Units in {zoneInfo.label}
              </span>
              <span className="text-white/40 text-xs">{filteredUnits.length} shown</span>
            </div>
            <div className="divide-y divide-white/5">
              {filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  className={`px-4 py-3 flex items-center gap-3 ${
                    unit.status === "scratched" ? "opacity-50" : ""
                  }`}
                >
                  {/* Unit number */}
                  <div className={`text-xl font-bold tabular-nums w-10 text-right flex-shrink-0 ${
                    unit.status === "scratched" ? "text-red-400 line-through" : "text-amber-400"
                  }`}>
                    {unit.unitNumber}
                  </div>

                  {/* Unit info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${
                      unit.status === "scratched" ? "text-white/40 line-through" : "text-white"
                    }`}>
                      {unit.unitName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {getStatusBadge(unit)}
                      {unit.stagingSpot && (
                        <span className="text-xs text-white/30">Spot: {unit.stagingSpot}</span>
                      )}
                      {unit.contactName && (
                        <span className="text-xs text-white/30 truncate">{unit.contactName}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {unit.status === "scratched" ? (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPresent(unit)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1 h-8"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Restore
                      </Button>
                    ) : unit.status === "staged" ? (
                      <Button
                        size="sm"
                        onClick={() => setConfirmScratch(unit)}
                        className="bg-red-600/80 hover:bg-red-600 text-white text-xs gap-1 h-8"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        No-Show
                      </Button>
                    ) : (
                      <span className="text-xs text-white/30 italic">
                        {unit.status === "marching" ? "On route" : unit.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="flex gap-4 justify-center text-xs text-white/30">
          <a href="/parade/login" className="hover:text-white/60 underline">Marshal Login</a>
          <a href="/parade/live" className="hover:text-white/60 underline">Live Board</a>
        </div>
      </div>

      {/* Confirm No-Show Dialog */}
      <Dialog open={!!confirmScratch} onOpenChange={(o) => !o && setConfirmScratch(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Mark as No-Show?
            </DialogTitle>
          </DialogHeader>
          {confirmScratch && (
            <div className="py-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                This will mark <strong>Unit {confirmScratch.unitNumber} — {confirmScratch.unitName}</strong> as a no-show.
                The unit will be removed from the active lineup. You can restore them if they arrive late.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmScratch(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => confirmScratch && handleMarkNoShow(confirmScratch)}
            >
              <UserX className="w-4 h-4 mr-2" />
              Yes, Mark No-Show
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Walk-Up Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold-600" />
              Add Walk-Up Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Add a participant who arrived at staging but was not in the original lineup.
              They will be added to the end of the parade order.
            </p>
            <div>
              <label className="text-sm font-medium block mb-1">Entry / Float Name <span className="text-red-500">*</span></label>
              <Input
                value={newEntry.unitName}
                onChange={(e) => setNewEntry((f) => ({ ...f, unitName: e.target.value }))}
                placeholder="e.g. Southport Fire Dept, Smith Family Float"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Entry Type</label>
              <select
                value={newEntry.entryType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewEntry((f) => ({ ...f, entryType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                <option value="float">Float</option>
                <option value="band">Band / Marching Group</option>
                <option value="vehicle">Vehicle</option>
                <option value="walking_group">Walking Group</option>
                <option value="equestrian">Equestrian</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Contact Name</label>
                <Input
                  value={newEntry.contactName}
                  onChange={(e) => setNewEntry((f) => ({ ...f, contactName: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Contact Phone</label>
                <Input
                  value={newEntry.contactPhone}
                  onChange={(e) => setNewEntry((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="910-555-0100"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Staging Spot (optional)</label>
              <Input
                value={newEntry.stagingSpot}
                onChange={(e) => setNewEntry((f) => ({ ...f, stagingSpot: e.target.value }))}
                placeholder="e.g. A-12, Row 3 Slot 2"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Notes (optional)</label>
              <Input
                value={newEntry.notes}
                onChange={(e) => setNewEntry((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any special notes for this entry"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddEntry}
              disabled={createUnit.isPending || !newEntry.unitName.trim()}
              className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold"
            >
              {createUnit.isPending ? "Adding…" : "Add to Lineup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
