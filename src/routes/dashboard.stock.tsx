import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type StockCategory = "materials" | "waste-materials";
type WasteMaterial = {
  id: string;
  material: string;
  size: string;
  note: string;
};

const materialTypes = ["MDF", "Plywood", "Laminate", "Veneer", "Acrylic", "Edge Band", "Hardware"];
const units = ["sheets", "pieces", "rolls", "kg", "meters", "boxes"];

function Stock() {
  const [list, setList] = useState<StockItem[]>(initial);
  const [wasteList, setWasteList] = useState<WasteMaterial[]>([
    { id: "W001", material: "MDF", size: "18mm offcuts", note: "Reusable for small panels" },
    { id: "W002", material: "Laminate", size: "Walnut scraps", note: "Keep for edge samples" },
    { id: "W003", material: "Edge Band", size: "22mm trimming", note: "Short roll balance" },
  ]);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<StockCategory>("materials");
  const [form, setForm] = useState<StockItem>({ id: "", material: "", type: "", quantity: 0, unit: "sheets" });
  const [wasteId, setWasteId] = useState("");
  const [wasteSize, setWasteSize] = useState("");

  const add = () => {
    const item = {
      ...form,
      material: form.type,
    };

    if (category === "waste-materials") {
      setWasteList((l) => [
        ...l,
        {
          id: wasteId.trim() || `W${String(l.length + 1).padStart(3, "0")}`,
          material: form.type,
          size: wasteSize,
          note: "",
        },
      ]);
    } else {
      setList((l) => [...l, { ...item, id: `S${String(l.length + 1).padStart(3, "0")}` }]);
    }

    setOpen(false);
    setCategory("materials");
    setForm({ id: "", material: "", type: "", quantity: 0, unit: "sheets" });
    setWasteId("");
    setWasteSize("");
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
                <Label>Stock Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as StockCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="waste-materials">Waste Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {category === "waste-materials" ? (
                <>
                  <div className="space-y-1.5">
                    <Label>ID</Label>
                    <Input value={wasteId} onChange={(e) => setWasteId(e.target.value)} placeholder="e.g. W004" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Size</Label>
                    <Input value={wasteSize} onChange={(e) => setWasteSize(e.target.value)} placeholder="e.g. 18mm offcuts" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Unit</Label>
                    <Select value={form.unit} onValueChange={(value) => setForm({ ...form, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={add}>Add stock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="waste-materials">Waste Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-4">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Material</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 text-right font-medium">Quantity</th>
                      <th className="px-4 py-3 font-medium">Unit</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{s.material}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.type}</td>
                        <td className="px-4 py-3 text-right font-semibold">{s.quantity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.unit}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            s.quantity < 50
                              ? "border-warning/30 bg-warning/15 text-warning-foreground"
                              : "border-success/20 bg-success/10 text-success"
                          }`}>
                            {s.quantity < 50 ? "Low" : "In stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="outline" onClick={() => adjust(s.id, -1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button size="icon" onClick={() => adjust(s.id, 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {list.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          No stock items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waste-materials" className="mt-4">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Material</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteList.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{s.id}</td>
                        <td className="px-4 py-3 font-medium">{s.material}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.size}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.note || "-"}</td>
                      </tr>
                    ))}
                    {wasteList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          No waste materials found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
