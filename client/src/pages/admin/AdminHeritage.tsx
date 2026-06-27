import { useState } from "react";
import { BookOpen, Plus, Edit, Trash2, Loader2, Users, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ── Presidents ─────────────────────────────────────────────────────────────────
type PresidentForm = { name: string; yearStart: number; yearEnd: number | undefined; bio: string; photoUrl: string };
const defaultPresident: PresidentForm = { name: "", yearStart: new Date().getFullYear(), yearEnd: undefined, bio: "", photoUrl: "" };

function PresidentsTab() {
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PresidentForm>(defaultPresident);
  const utils = trpc.useUtils();
  const { data: presidents, isLoading } = trpc.heritage.presidents.useQuery();

  const createMutation = trpc.heritage.createPresident.useMutation({
    onSuccess: () => { toast.success("President added"); utils.heritage.presidents.invalidate(); setShowDialog(false); setForm(defaultPresident); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.heritage.updatePresident.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.heritage.presidents.invalidate(); setShowDialog(false); setEditId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.heritage.deletePresident.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.heritage.presidents.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (p: any) => {
    setForm({ name: p.name, yearStart: p.yearStart, yearEnd: p.yearEnd ?? undefined, bio: p.bio ?? "", photoUrl: p.photoUrl ?? "" });
    setEditId(p.id); setShowDialog(true);
  };
  const handleSubmit = () => {
    if (!form.name) { toast.error("Name required"); return; }
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{presidents?.length ?? 0} presidents</p>
        <Button onClick={() => { setForm(defaultPresident); setEditId(null); setShowDialog(true); }} className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2" size="sm">
          <Plus className="w-3.5 h-3.5" /> Add President
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        : presidents && presidents.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-navy-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700">Term</th>
                <th className="text-right px-5 py-3 font-medium text-navy-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {presidents.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-navy-900">{p.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.yearStart}{p.yearEnd ? ` – ${p.yearEnd}` : " – Present"}</td>
                  <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                    <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-patriot-500"
                      onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: p.id }); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No presidents added yet</p>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif">{editId ? "Edit President" : "Add Past President"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-sm font-medium">Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Year Start</Label>
                <Input type="number" value={form.yearStart} onChange={(e) => setForm({ ...form, yearStart: parseInt(e.target.value) })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Year End (blank = present)</Label>
                <Input type="number" value={form.yearEnd ?? ""} onChange={(e) => setForm({ ...form, yearEnd: e.target.value ? parseInt(e.target.value) : undefined })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1.5 resize-none" rows={3} />
            </div>
            <div>
              <Label className="text-sm font-medium">Photo URL</Label>
              <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-patriot-600 hover:bg-patriot-700 text-white"
              disabled={createMutation.isPending || updateMutation.isPending}>
              {editId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Timeline ───────────────────────────────────────────────────────────────────
type TimelineForm = { year: number; title: string; description: string; category: string };
const defaultTimeline: TimelineForm = { year: new Date().getFullYear(), title: "", description: "", category: "milestone" };

function TimelineTab() {
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TimelineForm>(defaultTimeline);
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.heritage.timeline.useQuery();

  const createMutation = trpc.heritage.createTimeline.useMutation({
    onSuccess: () => { toast.success("Event added"); utils.heritage.timeline.invalidate(); setShowDialog(false); setForm(defaultTimeline); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.heritage.updateTimeline.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.heritage.timeline.invalidate(); setShowDialog(false); setEditId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.heritage.deleteTimeline.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.heritage.timeline.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (e: any) => {
    setForm({ year: e.year, title: e.title, description: e.description ?? "", category: e.category ?? "milestone" });
    setEditId(e.id); setShowDialog(true);
  };
  const handleSubmit = () => {
    if (!form.title) { toast.error("Title required"); return; }
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{events?.length ?? 0} timeline events</p>
        <Button onClick={() => { setForm(defaultTimeline); setEditId(null); setShowDialog(true); }} className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2" size="sm">
          <Plus className="w-3.5 h-3.5" /> Add Event
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        : events && events.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-navy-700">Year</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700">Title</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700 hidden md:table-cell">Category</th>
                <th className="text-right px-5 py-3 font-medium text-navy-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-display text-navy-600">{e.year}</td>
                  <td className="px-4 py-3 font-medium text-navy-900">{e.title}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground capitalize">{(e as any).category ?? "milestone"}</td>
                  <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                    <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => openEdit(e)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-patriot-500"
                      onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: e.id }); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Flag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No timeline events yet</p>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif">{editId ? "Edit Event" : "Add Timeline Event"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Year *</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1.5 w-full text-sm border border-border rounded-lg px-3 py-2 bg-white">
                  <option value="milestone">Milestone</option>
                  <option value="founding">Founding</option>
                  <option value="expansion">Expansion</option>
                  <option value="recognition">Recognition</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 resize-none" rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-patriot-600 hover:bg-patriot-700 text-white"
              disabled={createMutation.isPending || updateMutation.isPending}>
              {editId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminHeritage() {
  return (
    <AdminLayout title="Heritage" subtitle="Manage festival history, presidents, and timeline">
      <Tabs defaultValue="presidents">
        <TabsList className="mb-6">
          <TabsTrigger value="presidents" className="gap-2"><Users className="w-3.5 h-3.5" /> Past Presidents</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2"><Flag className="w-3.5 h-3.5" /> Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="presidents"><PresidentsTab /></TabsContent>
        <TabsContent value="timeline"><TimelineTab /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
