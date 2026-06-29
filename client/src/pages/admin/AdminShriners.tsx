/**
 * AdminShriners — Back-office management for all Shriner unit registrations.
 * Shows all Shriner entries with temple, unit type, member/vehicle counts,
 * staging zone, and approval status controls.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  Search,
  MapPin,
  Users,
  Car,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";

const UNIT_TYPE_LABELS: Record<string, string> = {
  mini_cars: "Mini Cars",
  motorcycles: "Motorcycles",
  clown_unit: "Clown Unit",
  marching: "Marching",
  color_guard: "Color Guard",
  band: "Band",
  go_karts: "Go-Karts / ATVs",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  waitlisted: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function AdminShriners() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const { data: allEntries = [], refetch, isLoading } = trpc.parade.list.useQuery({ year: 2026 });

  // Filter to Shriners only
  const shriners = allEntries.filter((e: any) => e.entryType === "shriners");

  const filtered = shriners.filter((e: any) => {
    const matchSearch =
      !search ||
      e.entryName?.toLowerCase().includes(search.toLowerCase()) ||
      e.shrinersTempleName?.toLowerCase().includes(search.toLowerCase()) ||
      e.contactFirstName?.toLowerCase().includes(search.toLowerCase()) ||
      e.contactLastName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = trpc.parade.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetch();
      setSelected(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const stats = {
    total: shriners.length,
    pending: shriners.filter((e: any) => e.status === "pending").length,
    approved: shriners.filter((e: any) => e.status === "approved").length,
    totalMembers: shriners.reduce((sum: number, e: any) => sum + (e.numberOfPeople ?? 0), 0),
    totalVehicles: shriners.reduce((sum: number, e: any) => sum + (e.shrinersVehicleCount ?? 0), 0),
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-gold-600 fill-gold-600" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-navy-900">Shriner Units</h1>
              <p className="text-sm text-muted-foreground">2026 Parade — S Atlantic Ave Staging</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 border-navy-200 text-navy-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Units", value: stats.total, icon: Star, color: "text-gold-600" },
            { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-600" },
            { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-green-600" },
            { label: "Total Members", value: stats.totalMembers, icon: Users, color: "text-navy-600" },
            { label: "Total Vehicles", value: stats.totalVehicles, icon: Car, color: "text-patriot-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-border p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold text-navy-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Staging info */}
        <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gold-600 shrink-0" />
          <p className="text-sm text-gold-800">
            All Shriner units are automatically assigned to <strong>S Atlantic Ave</strong> staging area.
            Assign specific spot numbers (A1, A2…) in each unit's detail view.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by temple, unit name, or contact…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="waitlisted">Waitlisted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50">
                <TableHead className="font-semibold text-navy-900">Temple / Unit</TableHead>
                <TableHead className="font-semibold text-navy-900">Type</TableHead>
                <TableHead className="font-semibold text-navy-900 text-center">Members</TableHead>
                <TableHead className="font-semibold text-navy-900 text-center">Vehicles</TableHead>
                <TableHead className="font-semibold text-navy-900">Contact</TableHead>
                <TableHead className="font-semibold text-navy-900">Staging Spot</TableHead>
                <TableHead className="font-semibold text-navy-900">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Loading Shriner registrations…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Star className="w-8 h-8 text-gold-300" />
                      <p className="font-medium">No Shriner units found</p>
                      <p className="text-sm">Registrations will appear here once submitted.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((entry: any) => (
                  <TableRow key={entry.id} className="hover:bg-gold-50/40 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-navy-900 text-sm">{entry.entryName}</p>
                        <p className="text-xs text-muted-foreground">{entry.shrinersTempleName}</p>
                        {entry.isReturning && (
                          <Badge variant="outline" className="text-xs mt-1 border-gold-300 text-gold-700">
                            Returning
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-navy-700">
                        {UNIT_TYPE_LABELS[entry.shrinersUnitType ?? "other"] ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-navy-900">{entry.numberOfPeople ?? "—"}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-navy-900">{entry.shrinersVehicleCount ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-navy-900">{entry.contactFirstName} {entry.contactLastName}</p>
                        <p className="text-xs text-muted-foreground">{entry.contactEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-navy-700">
                        {entry.stagingZone ?? "S Atlantic Ave"}
                        {entry.stagingSpot ? ` · ${entry.stagingSpot}` : ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${STATUS_COLORS[entry.status] ?? ""}`} variant="outline">
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(entry)}
                        className="gap-1 text-navy-600 hover:text-navy-900"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Dialog */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-serif text-navy-900">
                <Star className="w-5 h-5 text-gold-600 fill-gold-600" />
                {selected.entryName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Temple", value: selected.shrinersTempleName },
                  { label: "Unit Type", value: UNIT_TYPE_LABELS[selected.shrinersUnitType ?? "other"] },
                  { label: "Members", value: selected.numberOfPeople },
                  { label: "Vehicles", value: selected.shrinersVehicleCount ?? "None" },
                  { label: "Est. Length", value: selected.estimatedLength ?? "Not specified" },
                  { label: "Staging Zone", value: selected.stagingZone ?? "S Atlantic Ave" },
                  { label: "Staging Spot", value: selected.stagingSpot ?? "Not assigned" },
                  { label: "Returning", value: selected.isReturning ? "Yes" : "No" },
                  { label: "Contact", value: `${selected.contactFirstName} ${selected.contactLastName}` },
                  { label: "Email", value: selected.contactEmail },
                  { label: "Phone", value: selected.contactPhone ?? "—" },
                  { label: "Submitted", value: new Date(selected.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="font-medium text-navy-900">{value}</p>
                  </div>
                ))}
              </div>
              {selected.shrinersSpecialEquipment && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Special Equipment</p>
                  <p className="text-navy-700 bg-gold-50 rounded-lg p-3">{selected.shrinersSpecialEquipment}</p>
                </div>
              )}
              {selected.specialRequirements && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Additional Notes</p>
                  <p className="text-navy-700 bg-navy-50 rounded-lg p-3">{selected.specialRequirements}</p>
                </div>
              )}

              {/* Status actions */}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateStatus.mutate({ id: selected.id, status: "approved" })}
                    disabled={selected.status === "approved" || updateStatus.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus.mutate({ id: selected.id, status: "waitlisted" })}
                    disabled={selected.status === "waitlisted" || updateStatus.isPending}
                    className="border-blue-300 text-blue-700 gap-1"
                  >
                    <Clock className="w-4 h-4" /> Waitlist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus.mutate({ id: selected.id, status: "rejected" })}
                    disabled={selected.status === "rejected" || updateStatus.isPending}
                    className="border-red-300 text-red-700 gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
