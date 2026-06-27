import { useState } from "react";
import { UserCheck, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";

export default function AdminSignups() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Use listByEvent with eventId=0 to get all signups (0 = all events)
  const { data: allSignups, isLoading } = trpc.signups.listByEvent.useQuery({ eventId: 0 });

  const filtered = (allSignups ?? []).filter((s: any) =>
    (typeFilter === "all" || s.type === typeFilter) &&
    (!search || `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout title="Event Signups" subtitle="All attendee and volunteer registrations">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="attendee">Attendees</SelectItem>
            <SelectItem value="volunteer">Volunteers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading signups...
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-navy-700">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-navy-700 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-navy-700 hidden lg:table-cell">Event</th>
                  <th className="text-center px-4 py-3 font-medium text-navy-700">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-navy-700 hidden xl:table-cell">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-navy-900">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{(s as any).eventTitle ?? `Event #${s.eventId}`}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={cn("text-xs", s.type === "volunteer" ? "bg-gold-100 text-gold-700" : "bg-patriot-100 text-patriot-700")}>
                        {s.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No signups found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
