import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

interface PinForm {
  pin: string;
  label: string;
  marshalName: string;
  checkpointId: string;
}

// Checkpoint options — value matches the actual checkpoint ID in the database
// null/"" = Start Line (no checkpoint), others = checkpoint IDs
const CHECKPOINT_OPTIONS = [
  { value: "",      label: "Station 1 — Start Line (Atlantic Ave & E Moore St)" },
  { value: "60001", label: "Station 2 — Howe St & Moore St" },
  { value: "2",     label: "Station 3 — Howe St & West St" },
  { value: "3",     label: "Station 4 — Howe St & 9th St" },
  { value: "4",     label: "Station 5 — Howe St & Fodale Ave (Turn)" },
  { value: "30001", label: "Station 6 — Nursing Home Parking Lot (Disband)" },
];

export default function AdminMarshalPins() {
  const [year] = useState(CURRENT_YEAR);
  const [showPins, setShowPins] = useState<Record<number, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PinForm>({
    pin: generatePin(),
    label: "",
    marshalName: "",
    checkpointId: "",
  });

  const utils = trpc.useUtils();
  const { data: pins = [], isLoading } = trpc.marshalPins.list.useQuery({ year });

  const createMutation = trpc.marshalPins.create.useMutation({
    onSuccess: () => {
      toast.success("Marshal PIN created");
      utils.marshalPins.list.invalidate();
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.marshalPins.update.useMutation({
    onSuccess: () => {
      toast.success("PIN updated");
      utils.marshalPins.list.invalidate();
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.marshalPins.delete.useMutation({
    onSuccess: () => {
      toast.success("PIN deleted");
      utils.marshalPins.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleActiveMutation = trpc.marshalPins.update.useMutation({
    onSuccess: () => utils.marshalPins.list.invalidate(),
  });

  const openCreate = () => {
    setEditId(null);
    setForm({ pin: generatePin(), label: "", marshalName: "", checkpointId: "" });
    setDialogOpen(true);
  };

  const openEdit = (pin: (typeof pins)[0]) => {
    setEditId(pin.id);
    setForm({
      pin: pin.pin,
      label: pin.label,
      marshalName: pin.marshalName ?? "",
      checkpointId: pin.checkpointId ? String(pin.checkpointId) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.label.trim()) { toast.error("Label is required"); return; }
    if (form.pin.length < 4) { toast.error("PIN must be at least 4 digits"); return; }

    const payload = {
      year,
      pin: form.pin,
      label: form.label.trim(),
      marshalName: form.marshalName.trim() || undefined,
      checkpointId: form.checkpointId ? parseInt(form.checkpointId) : undefined,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    toast.success("PIN copied to clipboard");
  };

  const toggleShow = (id: number) => {
    setShowPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-navy-900">Marshal PINs</h1>
              <p className="text-sm text-gray-500">
                Manage 4-digit access PINs for parade marshals — {year} season
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-navy-800 hover:bg-navy-700 text-white gap-2">
            <Plus className="w-4 h-4" /> New PIN
          </Button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
          <strong>How it works:</strong> Each marshal receives a unique 4-digit PIN. When they open their
          station page on parade day, they enter this PIN to unlock it. PINs are valid for 12 hours once
          entered. The <strong>Start Line PIN</strong> (no checkpoint) unlocks the Marshal Start page.
          Checkpoint PINs unlock the specific checkpoint station.
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading PINs…</div>
        ) : pins.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No marshal PINs yet</p>
            <p className="text-gray-400 text-sm mb-4">Create PINs for each marshal station before parade day</p>
            <Button onClick={openCreate} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Create First PIN
            </Button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Station / Label</TableHead>
                  <TableHead>Marshal Name</TableHead>
                  <TableHead>PIN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pins.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium text-navy-900">{p.label}</div>
                      <div className="text-xs text-gray-400">
                        {p.checkpointId
                          ? CHECKPOINT_OPTIONS.find((c) => c.value === String(p.checkpointId))?.label ?? `Checkpoint ${p.checkpointId}`
                          : "Start Line Marshal"}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {p.marshalName ?? <span className="text-gray-300 italic">Not assigned</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-lg font-bold tracking-widest text-navy-800">
                          {showPins[p.id] ? p.pin : "••••"}
                        </code>
                        <button
                          onClick={() => toggleShow(p.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title={showPins[p.id] ? "Hide PIN" : "Show PIN"}
                        >
                          {showPins[p.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyPin(p.pin)}
                          className="text-gray-400 hover:text-blue-600"
                          title="Copy PIN"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: p.id, isActive: !p.isActive })}
                        className="cursor-pointer"
                      >
                        <Badge
                          variant={p.isActive ? "default" : "secondary"}
                          className={p.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                        >
                          {p.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(p)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete PIN for "${p.label}"?`)) {
                              deleteMutation.mutate({ id: p.id });
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editId ? "Edit Marshal PIN" : "Create Marshal PIN"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Station Label <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Start Line Marshal, Howe St Checkpoint"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Checkpoint (leave blank for Start Line)
                </label>
                <select
                  value={form.checkpointId}
                  onChange={(e) => setForm((f) => ({ ...f, checkpointId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                  {CHECKPOINT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Marshal Name (optional)
                </label>
                <Input
                  value={form.marshalName}
                  onChange={(e) => setForm((f) => ({ ...f, marshalName: e.target.value }))}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  PIN (4 digits) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    value={form.pin}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setForm((f) => ({ ...f, pin: v }));
                    }}
                    placeholder="4-digit PIN"
                    className="font-mono text-lg tracking-widest"
                    maxLength={8}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setForm((f) => ({ ...f, pin: generatePin() }))}
                    title="Generate random PIN"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-navy-800 hover:bg-navy-700 text-white"
              >
                {editId ? "Save Changes" : "Create PIN"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
