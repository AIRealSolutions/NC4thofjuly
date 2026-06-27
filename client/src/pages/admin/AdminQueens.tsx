import { useState } from "react";
import { Crown, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type QueenForm = { year: number; name: string; title: string; hometown: string; bio: string; photoUrl: string; sortOrder: number };
const defaultForm: QueenForm = { year: new Date().getFullYear(), name: "", title: "Festival Queen", hometown: "", bio: "", photoUrl: "", sortOrder: 0 };

export default function AdminQueens() {
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<QueenForm>(defaultForm);

  const utils = trpc.useUtils();
  const { data: queens, isLoading } = trpc.queens.list.useQuery();

  const createMutation = trpc.queens.create.useMutation({
    onSuccess: () => { toast.success("Queen added"); utils.queens.list.invalidate(); setShowDialog(false); setForm(defaultForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.queens.update.useMutation({
    onSuccess: () => { toast.success("Queen updated"); utils.queens.list.invalidate(); setShowDialog(false); setEditId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.queens.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.queens.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => { setForm(defaultForm); setEditId(null); setShowDialog(true); };
  const openEdit = (q: any) => {
    setForm({ year: q.year, name: q.name, title: q.title ?? "", hometown: q.hometown ?? "", bio: q.bio ?? "", photoUrl: q.photoUrl ?? "", sortOrder: q.sortOrder ?? 0 });
    setEditId(q.id); setShowDialog(true);
  };
  const handleSubmit = () => {
    if (!form.name) { toast.error("Name is required"); return; }
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  };

  const sorted = queens ? [...queens].sort((a, b) => b.year - a.year) : [];

  return (
    <AdminLayout title="Festival Queens" subtitle="Manage the queens gallery">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{queens?.length ?? 0} queens in gallery</p>
        <Button onClick={openCreate} className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Queen
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : sorted.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-navy-700">Year</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700 hidden md:table-cell">Title</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700 hidden lg:table-cell">Hometown</th>
                <th className="text-right px-5 py-3 font-medium text-navy-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-display text-lg text-gold-600">{q.year}</td>
                  <td className="px-4 py-3 font-medium text-navy-900">{q.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{q.title}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{q.hometown}</td>
                  <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                    <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => openEdit(q)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-patriot-500"
                      onClick={() => { if (confirm("Delete this entry?")) deleteMutation.mutate({ id: q.id }); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No queens added yet</p>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif">{editId ? "Edit Queen" : "Add Festival Queen"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Year *</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Festival Queen" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Hometown</Label>
              <Input value={form.hometown} onChange={(e) => setForm({ ...form, hometown: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Photo URL</Label>
              <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1.5 resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-patriot-600 hover:bg-patriot-700 text-white"
              disabled={createMutation.isPending || updateMutation.isPending}>
              {editId ? "Save" : "Add Queen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
