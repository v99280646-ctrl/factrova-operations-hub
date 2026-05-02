import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { customers, projects as initial, services, type Project, type ProjectStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/projects")({
  head: () => ({ meta: [{ title: "Projects — Factrova" }] }),
  component: Projects,
});

function Projects() {
  const [list, setList] = useState<Project[]>(initial);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [open, setOpen] = useState(false);

  const filtered = list.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      [p.name, p.customer].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <DashboardLayout title="Projects">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" className="pl-9" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as ProjectStatus | "all")}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="hold">On hold</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Delivery</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.customer}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.delivery}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{p.amount.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No projects match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CreateProjectDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={(p) => setList((l) => [p, ...l])}
      />
    </DashboardLayout>
  );
}

const STEPS = ["Basic info", "Material", "Services", "Summary"] as const;

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Project) => void;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    customer: "",
    name: "",
    delivery: "",
    notes: "",
    sheets: 0,
    sheetType: "MDF",
    sheetSize: "8x4 ft",
    selectedServices: {} as Record<string, number>,
  });

  const total = services.reduce(
    (s, sv) => s + (data.selectedServices[sv.id] ?? 0) * sv.rate,
    0,
  );

  const reset = () => { setStep(0); setData({ customer: "", name: "", delivery: "", notes: "", sheets: 0, sheetType: "MDF", sheetSize: "8x4 ft", selectedServices: {} }); };

  const create = () => {
    onCreate({
      id: `P${Math.floor(Math.random() * 900 + 100)}`,
      name: data.name || "Untitled project",
      customer: data.customer || "—",
      status: "ongoing",
      progress: 5,
      delivery: data.delivery || "TBD",
      amount: total,
    });
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Create new project</DialogTitle></DialogHeader>

        {/* Stepper */}
        <ol className="mt-2 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  i < step && "border-primary bg-primary text-primary-foreground",
                  i === step && "border-primary bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]",
                  i > step && "border-border text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-xs font-medium sm:inline", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
              {i < STEPS.length - 1 && <span className="ml-1 h-px flex-1 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="mt-4 min-h-[260px]">
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-1">
                <Label>Customer</Label>
                <Select value={data.customer} onValueChange={(v) => setData({ ...data, customer: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => <SelectItem key={c.id} value={c.company}>{c.company}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Project Name</Label>
                <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="e.g. Sterling HQ Cabinets" />
              </div>
              <div className="space-y-1.5">
                <Label>Delivery Date</Label>
                <Input type="date" value={data.delivery} onChange={(e) => setData({ ...data, delivery: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Notes</Label>
                <Textarea rows={3} value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} placeholder="Additional details…" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Number of Sheets</Label>
                <Input type="number" value={data.sheets || ""} onChange={(e) => setData({ ...data, sheets: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Sheet Type</Label>
                <Select value={data.sheetType} onValueChange={(v) => setData({ ...data, sheetType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MDF">MDF</SelectItem>
                    <SelectItem value="Plywood">Plywood</SelectItem>
                    <SelectItem value="Particle Board">Particle Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sheet Size</Label>
                <Select value={data.sheetSize} onValueChange={(v) => setData({ ...data, sheetSize: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8x4 ft">8 × 4 ft</SelectItem>
                    <SelectItem value="7x4 ft">7 × 4 ft</SelectItem>
                    <SelectItem value="6x4 ft">6 × 4 ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              {services.map((sv) => {
                const qty = data.selectedServices[sv.id] ?? 0;
                const checked = qty > 0;
                return (
                  <div key={sv.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) =>
                          setData((d) => ({
                            ...d,
                            selectedServices: { ...d.selectedServices, [sv.id]: c ? d.selectedServices[sv.id] || d.sheets || 1 : 0 },
                          }))
                        }
                      />
                      <div>
                        <p className="text-sm font-medium">{sv.label}</p>
                        <p className="text-xs text-muted-foreground">₹{sv.rate} per sheet</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={qty || ""}
                        disabled={!checked}
                        onChange={(e) =>
                          setData((d) => ({
                            ...d,
                            selectedServices: { ...d.selectedServices, [sv.id]: Number(e.target.value) },
                          }))
                        }
                        className="h-9 w-24"
                        placeholder="Qty"
                      />
                      <span className="w-24 text-right text-sm font-semibold">₹{(qty * sv.rate).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                <Row k="Customer" v={data.customer || "—"} />
                <Row k="Project" v={data.name || "—"} />
                <Row k="Delivery" v={data.delivery || "—"} />
                <Row k="Material" v={`${data.sheets || 0} × ${data.sheetType} (${data.sheetSize})`} />
              </div>
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected services</div>
                <div className="divide-y divide-border">
                  {services
                    .filter((sv) => (data.selectedServices[sv.id] ?? 0) > 0)
                    .map((sv) => {
                      const qty = data.selectedServices[sv.id]!;
                      return (
                        <div key={sv.id} className="flex items-center justify-between px-4 py-2 text-sm">
                          <span>{sv.label} <span className="text-muted-foreground">× {qty}</span></span>
                          <span className="font-medium">₹{(qty * sv.rate).toLocaleString("en-IN")}</span>
                        </div>
                      );
                    })}
                  {Object.values(data.selectedServices).every((v) => !v) && (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No services selected</div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border bg-[image:var(--gradient-soft)] px-4 py-3">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={create}>Create Order</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
