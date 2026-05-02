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
import { Plus, Minus, PackagePlus } from "lucide-react";
import { stock as initial, type StockItem } from "@/lib/data";

export const Route = createFileRoute("/dashboard/stock")({
  head: () => ({ meta: [{ title: "Stock Management — Factrova" }] }),
  component: Stock,
});

function Stock() {
  const [list, setList] = useState<StockItem[]>(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StockItem>({ id: "", material: "", type: "", quantity: 0, unit: "sheets" });

  const add = () => {
    setList((l) => [...l, { ...form, id: `S${String(l.length + 1).padStart(3, "0")}` }]);
    setOpen(false);
    setForm({ id: "", material: "", type: "", quantity: 0, unit: "sheets" });
  };

  const adjust = (id: string, delta: number) =>
    setList((l) => l.map((s) => (s.id === id ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s)));

  return (
    <DashboardLayout title="Stock Management">
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><PackagePlus className="mr-1 h-4 w-4" /> Add Stock</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add stock item</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Material</Label>
                <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={add}>Add stock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => (
          <Card key={s.id} className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.type}</p>
                  <p className="mt-1 text-base font-semibold">{s.material}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                  s.quantity < 50 ? "border-warning/30 bg-warning/15 text-warning-foreground" : "border-success/20 bg-success/10 text-success"
                }`}>
                  {s.quantity < 50 ? "Low" : "In stock"}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold tracking-tight">{s.quantity}</p>
                  <p className="text-xs text-muted-foreground">{s.unit} available</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" onClick={() => adjust(s.id, -1)}><Minus className="h-4 w-4" /></Button>
                  <Button size="icon" onClick={() => adjust(s.id, 1)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
