import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "parade", label: "Parade" },
  { value: "ceremony", label: "Ceremony" },
  { value: "entertainment", label: "Entertainment" },
  { value: "arts", label: "Arts & Crafts" },
  { value: "sports", label: "Sports" },
  { value: "family", label: "Family" },
  { value: "ball", label: "Ball / Gala" },
  { value: "fireworks", label: "Fireworks" },
  { value: "other", label: "Other" },
];

const CATEGORY_COLORS: Record<string, string> = {
  parade: "bg-patriot-100 text-patriot-700",
  ceremony: "bg-navy-100 text-navy-700",
  entertainment: "bg-purple-100 text-purple-700",
  arts: "bg-amber-100 text-amber-700",
  sports: "bg-green-100 text-green-700",
  family: "bg-pink-100 text-pink-700",
  ball: "bg-gold-100 text-gold-700",
  fireworks: "bg-orange-100 text-orange-700",
  other: "bg-slate-100 text-slate-700",
};

type EventForm = {
  slug: string; title: string; description: string; shortDescription: string;
  category: string; location: string; allowSignup: boolean; allowVolunteer: boolean; isActive: boolean; sortOrder: number;
};

const defaultForm: EventForm = {
  slug: "", title: "", description: "", shortDescription: "",
  category: "other", location: "", allowSignup: false, allowVolunteer: false, isActive: true, sortOrder: 0,
};

export default function AdminEvents() {
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);

  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.events.list.useQuery({ activeOnly: false });

  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => { toast.success("Event created"); utils.events.list.invalidate(); setShowDialog(false); setForm(defaultForm); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.events.update.useMutation({
    onSuccess: () => { toast.success("Event updated"); utils.events.list.invalidate(); setShowDialog(false); setForm(defaultForm); setEditId(null); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => { toast.success("Event deleted"); utils.events.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => { setForm(defaultForm); setEditId(null); setShowDialog(true); };
  const openEdit = (event: any) => {
    setForm({
      slug: event.slug, title: event.title, description: event.description ?? "",
      shortDescription: event.shortDescription ?? "", category: event.category,
      location: event.location ?? "", allowSignup: event.allowSignup ?? false,
      allowVolunteer: event.allowVolunteer ?? false, isActive: event.isActive ?? true,
      sortOrder: event.sortOrder ?? 0,
    });
    setEditId(event.id);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.slug) { toast.error("Title and slug are required"); return; }
    const payload = { ...form, category: form.category as any };
    if (editId) updateMutation.mutate({ id: editId, data: payload });
    else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Events" subtitle="Manage all festival events">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{events?.length ?? 0} events total</p>
        </div>
        <Button onClick={openCreate} className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading events...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {events && events.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-navy-700">Event</th>
                  <th className="text-left px-4 py-3 font-medium text-navy-700 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-navy-700 hidden lg:table-cell">Location</th>
                  <th className="text-center px-4 py-3 font-medium text-navy-700 hidden sm:table-cell">Signup</th>
                  <th className="text-center px-4 py-3 font-medium text-navy-700 hidden sm:table-cell">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy-900">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge className={cn("text-xs capitalize", CATEGORY_COLORS[event.category] ?? "bg-slate-100 text-slate-700")}>
                        {event.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{event.location ?? "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-center">
                      {event.allowSignup ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-center">
                      {event.isActive
                        ? <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                        : <Badge className="bg-slate-100 text-slate-500 text-xs">Hidden</Badge>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => openEdit(event)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-patriot-500 hover:text-patriot-700"
                          onClick={() => { if (confirm("Delete this event?")) deleteMutation.mutate({ id: event.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No events yet</p>
              <p className="text-xs mt-1">Add your first event to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editId ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-sm font-medium">Event Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium">URL Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="e.g., beach-day" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1.5" />
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium">Short Description</Label>
                <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="mt-1.5" />
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium">Full Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 resize-none" rows={4} />
              </div>
              <div className="col-span-2 flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Label className="text-sm">Allow Event Signups</Label>
                  <Switch checked={form.allowSignup} onCheckedChange={(v) => setForm({ ...form, allowSignup: v })} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Label className="text-sm">Allow Volunteer Signups</Label>
                  <Switch checked={form.allowVolunteer} onCheckedChange={(v) => setForm({ ...form, allowVolunteer: v })} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Label className="text-sm">Active (visible on public site)</Label>
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-patriot-600 hover:bg-patriot-700 text-white" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
