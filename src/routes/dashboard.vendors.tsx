import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { vendors as initial, type Vendor } from "@/lib/data";

export const Route = createFileRoute("/dashboard/vendors")({
  head: () => ({ meta: [{ title: "Vendors — Factrova" }] }),
  component: Vendors,
});

function Vendors() {
  const [list, setList] = useState<Vendor[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const blank: Vendor = { id: "", name: "", contact: "", materials: "" };
  const [form, setForm] = useState<Vendor>(blank);

  const save = () => {
    if (editing) setList((l) => l.map((v) => (v.id === editing.id ? { ...form, id: editing.id } : v)));
    else setList((l) => [...l, { ...form, id: `V${String(l.length + 1).padStart(3, "0")}` }]);
    setOpen(false); setEditing(null); setForm(blank);
  };

  return (
    <DashboardLayout title="Vendors">
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(blank); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(blank); }}>
              <Plus className="mr-1 h-4 w-4" /> Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit vendor" : "New vendor"}</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2">
              <FormField label="Vendor Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <FormField label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
              <FormField label="Materials Supplied" value={form.materials} onChange={(v) => setForm({ ...form, materials: v })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Save changes" : "Add vendor"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Materials</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((v) => (
                  <tr key={v.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.contact}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.materials}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(v); setForm(v); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setList((l) => l.filter((x) => x.id !== v.id))}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
