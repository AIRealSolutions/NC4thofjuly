import { useState } from "react";
import { Flag, Search, CheckCircle, XCircle, Clock, Loader2, Download, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-blue-100 text-blue-700",
};

const ENTRY_TYPE_LABELS: Record<string, string> = {
  float: "Float", marching_band: "Marching Band", vehicle: "Vehicle",
  walking_group: "Walking Group", equestrian: "Equestrian", shriners: "Shriners", other: "Other",
};

export default function AdminParade() {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeTab, setTypeTab] = useState<"all" | "shriners" | "standard">("all");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const utils = trpc.useUtils();
  const currentYear = parseInt(yearFilter);

  const { data: entries, isLoading } = trpc.parade.list.useQuery({ year: currentYear, status: statusFilter === "all" ? undefined : statusFilter as any });

  const updateStatusMutation = trpc.parade.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.parade.list.invalidate(); setSelectedEntry(null); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = entries?.filter((e) => {
    const matchSearch = !search || e.entryName.toLowerCase().includes(search.toLowerCase()) ||
      e.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
      `${e.contactFirstName} ${e.contactLastName}`.toLowerCase().includes(search.toLowerCase());
    const matchType = typeTab === "all" || (typeTab === "shriners" ? e.entryType === "shriners" : e.entryType !== "shriners");
    return matchSearch && matchType;
  }) ?? [];

  const counts = {
    all: entries?.length ?? 0,
    pending: entries?.filter((e) => e.status === "pending").length ?? 0,
    approved: entries?.filter((e) => e.status === "approved").length ?? 0,
    rejected: entries?.filter((e) => e.status === "rejected").length ?? 0,
    shriners: entries?.filter((e) => e.entryType === "shriners").length ?? 0,
  };

  return (
    <AdminLayout title="Parade Entries" subtitle={`${yearFilter} Grand Independence Day Parade`}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[2026, 2025, 2024, 2023].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "shriners", "standard"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeTab(t)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              typeTab === t
                ? t === "shriners" ? "bg-gold-500 text-white" : "bg-navy-800 text-white"
                : "bg-white border border-border text-navy-700 hover:bg-slate-50"
            )}
          >
            {t === "shriners" && <Star className="w-3.5 h-3.5" />}
            {t === "all" ? `All Entries (${counts.all})` : t === "shriners" ? `Shriners (${counts.shriners})` : `Standard (${counts.all - counts.shriners})`}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", count: counts.all, color: "text-navy-600", bg: "bg-navy-50" },
          { label: "Pending", count: counts.pending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved", count: counts.approved, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected", count: counts.rejected, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border shadow-sm p-4 text-center">
            <div className={cn("text-2xl font-display mb-1", s.color)}>{s.count}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading entries...
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-navy-700">Entry</th>
                  <th className="text-left px-4 py-3 font-medium text-navy-700 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-navy-700 hidden lg:table-cell">Contact</th>
                  <th className="text-center px-4 py-3 font-medium text-navy-700 hidden sm:table-cell">Returning</th>
                  <th className="text-center px-4 py-3 font-medium text-navy-700">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((entry) => (
                  <tr key={entry.id} className={cn("hover:bg-slate-50 transition-colors", entry.entryType === "shriners" && "bg-amber-50/60 hover:bg-amber-50")}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {entry.entryType === "shriners" && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        <p className="font-medium text-navy-900">{entry.entryName}</p>
                      </div>
                      {entry.organization && <p className="text-xs text-muted-foreground">{entry.organization}</p>}
                      {entry.entryType === "shriners" && entry.shrinersTempleName && (
                        <p className="text-xs text-amber-600">{entry.shrinersTempleName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge className={cn("text-xs", entry.entryType === "shriners" ? "bg-amber-100 text-amber-800" : "bg-navy-100 text-navy-700")}>{ENTRY_TYPE_LABELS[entry.entryType] ?? entry.entryType}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-navy-800">{entry.contactFirstName} {entry.contactLastName}</p>
                      <p className="text-xs text-muted-foreground">{entry.contactEmail}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-center">
                      {entry.isReturning ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground/40 text-xs">New</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={cn("text-xs capitalize", STATUS_COLORS[entry.status] ?? "bg-slate-100 text-slate-700")}>
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={() => setSelectedEntry(entry)}>
                        <Eye className="w-3.5 h-3.5" /> Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No parade entries found</p>
            <p className="text-xs mt-1">Entries will appear here when participants register.</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{selectedEntry.entryName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Entry Type</p>
                  <p className="font-medium">{ENTRY_TYPE_LABELS[selectedEntry.entryType]}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Year</p>
                  <p className="font-medium">{selectedEntry.year}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Contact</p>
                  <p className="font-medium">{selectedEntry.contactFirstName} {selectedEntry.contactLastName}</p>
                  <p className="text-xs text-muted-foreground">{selectedEntry.contactEmail}</p>
                  {selectedEntry.contactPhone && <p className="text-xs text-muted-foreground">{selectedEntry.contactPhone}</p>}
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Returning Participant</p>
                  <p className="font-medium">{selectedEntry.isReturning ? "Yes" : "No (New)"}</p>
                </div>
                {selectedEntry.estimatedLength && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Est. Length</p>
                    <p className="font-medium">{selectedEntry.estimatedLength}</p>
                  </div>
                )}
                {selectedEntry.numberOfPeople && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">People</p>
                    <p className="font-medium">{selectedEntry.numberOfPeople}</p>
                  </div>
                )}
              </div>
              {selectedEntry.description && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{selectedEntry.description}</p>
                </div>
              )}
              {selectedEntry.specialRequirements && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <p className="text-xs text-amber-700 font-medium mb-1">Special Requirements</p>
                  <p className="text-sm">{selectedEntry.specialRequirements}</p>
                </div>
              )}
              {selectedEntry.requiresElectricity && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium">⚡ Requires electrical power during staging</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-navy-800 mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {["approved", "pending", "rejected", "waitlisted"].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedEntry.status === status ? "default" : "outline"}
                      className={cn("text-xs capitalize", selectedEntry.status === status ? "bg-patriot-600 text-white" : "")}
                      onClick={() => updateStatusMutation.mutate({ id: selectedEntry.id, status: status as any })}
                      disabled={updateStatusMutation.isPending}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
