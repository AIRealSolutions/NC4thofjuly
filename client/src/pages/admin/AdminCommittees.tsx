import { useState } from "react";
import { Users, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type MemberForm = { name: string; role: string; committee: string; email: string; phone: string; yearStart: number; isActive: boolean; sortOrder: number };
const defaultForm: MemberForm = { name: "", role: "", committee: "", email: "", phone: "", yearStart: new Date().getFullYear(), isActive: true, sortOrder: 0 };

export default function AdminCommittees() {
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<MemberForm>(defaultForm);
  const [committeeFilter, setCommitteeFilter] = useState("all");

  const utils = trpc.useUtils();
  const { data: members, isLoading } = trpc.committees.list.useQuery({ activeOnly: false });

  const createMutation = trpc.committees.create.useMutation({
    onSuccess: () => { toast.success("Member added"); utils.committees.list.invalidate(); setShowDialog(false); setForm(defaultForm); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.committees.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.committees.list.invalidate(); setShowDialog(false); setEditId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.committees.delete.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.committees.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (m: any) => {
    setForm({ name: m.name, role: m.role, committee: m.committee ?? "", email: m.email ?? "", phone: m.phone ?? "", yearStart: m.yearStart ?? new Date().getFullYear(), isActive: m.isActive ?? true, sortOrder: m.sortOrder ?? 0 });
    setEditId(m.id); setShowDialog(true);
  };
  const handleSubmit = () => {
    if (!form.name || !form.role) { toast.error("Name and role are required"); return; }
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  };

  const committees = Array.from(new Set(members?.map((m) => m.committee ?? "General").filter(Boolean) ?? [])).sort();
  const filtered = committeeFilter === "all" ? (members ?? []) : (members ?? []).filter((m) => (m.committee ?? "General") === committeeFilter);

  return (
    <AdminLayout title="Committee Members" subtitle="Manage the committee directory">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={committeeFilter}
            onChange={(e) => setCommitteeFilter(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-white text-navy-800"
          >
            <option value="all">All Committees</option>
            {committees.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Button onClick={() => { setForm(defaultForm); setEditId(null); setShowDialog(true); }} className="bg-patriot-600 hover:bg-patriot-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : filtered.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-navy-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700">Role</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700 hidden md:table-cell">Committee</th>
                <th className="text-left px-4 py-3 font-medium text-navy-700 hidden lg:table-cell">Email</th>
                <th className="text-center px-4 py-3 font-medium text-navy-700 hidden sm:table-cell">Active</th>
                <th className="text-right px-5 py-3 font-medium text-navy-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-navy-900">{m.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.role}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge className="bg-navy-100 text-navy-700 text-xs">{m.committee ?? "General"}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{m.email ?? "—"}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-center">
                    <div className={`w-2 h-2 rounded-full mx-auto ${m.isActive ? "bg-green-500" : "bg-slate-300"}`} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => openEdit(m)}><Edit className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-patriot-500"
                        onClick={() => { if (confirm("Remove this member?")) deleteMutation.mutate({ id: m.id }); }}>
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
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No committee members found</p>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif">{editId ? "Edit Member" : "Add Committee Member"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-sm font-medium">Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Role / Title *</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g., Division Chair" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Committee / Division</Label>
              <Input value={form.committee} onChange={(e) => setForm({ ...form, committee: e.target.value })} placeholder="e.g., Events Division" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Year Start</Label>
                <Input type="number" value={form.yearStart} onChange={(e) => setForm({ ...form, yearStart: parseInt(e.target.value) })} className="mt-1.5" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label className="text-sm">Active Member</Label>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-patriot-600 hover:bg-patriot-700 text-white"
              disabled={createMutation.isPending || updateMutation.isPending}>
              {editId ? "Save" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
