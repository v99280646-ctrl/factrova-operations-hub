import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
} from "lucide-react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { projects as initial, type Project, type ProjectStatus } from "@/lib/data";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/projects")({
  head: () => ({ meta: [{ title: "Projects — Factrova" }] }),
  component: Projects,
});

type Customer = { id: string; company: string };
type Service = { id: string; name: string };

function Projects() {
  const [list, setList] = useState<Project[]>(initial);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<"admin" | "employee">("admin");
  const employeeMode = loginRole === "employee";

  const filtered = list.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      [p.name, p.customer].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  useEffect(() => {
    const storedRole = localStorage.getItem("factrova-login-role");
    setLoginRole(storedRole === "employee" ? "employee" : "admin");
  }, []);

  return (
    <DashboardLayout title={employeeMode ? "My Projects" : "Projects"}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as ProjectStatus | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="hold">On hold</SelectItem>
          </SelectContent>
        </Select>
        {!employeeMode && (
          <div className="ml-auto">
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> New Project
            </Button>
          </div>
        )}
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
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.delivery}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No projects match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!employeeMode && (
        <CreateProjectDialog
          open={open}
          onOpenChange={setOpen}
          onCreate={(p) => setList((l) => [p, ...l])}
        />
      )}
    </DashboardLayout>
  );
}

const STEPS = ["Basic info", "Materials", "Services", "Summary"] as const;

type MaterialRow = { id: string; type: string; size: string; sheets: number };

const MATERIAL_TYPES = ["MDF", "Plywood", "Particle Board", "HDHMR", "BWP Ply"];
const SHEET_SIZES = ["8 × 4 ft", "7 × 4 ft", "6 × 4 ft"];

function newMaterial(): MaterialRow {
  return {
    id: crypto.randomUUID(),
    type: "MDF",
    size: "8 × 4 ft",
    sheets: 0,
  };
}

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addCustOpen, setAddCustOpen] = useState(false);
  const [advancedCustomerOpen, setAdvancedCustomerOpen] = useState(false);
  const [newCust, setNewCust] = useState({
    company: "",
    contact: "",
    phone: "",
    address: "",
    state: "",
    district: "",
    pincode: "",
    gstin: "",
  });
  const [data, setData] = useState({
    workType: "own" as "own" | "job",
    customer: "",
    name: "",
    delivery: "",
    notes: "",
    materials: [newMaterial()] as MaterialRow[],
    selectedServiceIds: [] as string[],
  });

  const loadLookups = async () => {
    const [{ data: cs }, { data: ss }] = await Promise.all([
      supabase.from("customers").select("id, company").order("company"),
      supabase.from("services").select("id, name").order("name"),
    ]);
    setCustomers((cs ?? []) as Customer[]);
    setServices((ss ?? []) as Service[]);
  };

  useEffect(() => {
    if (open) loadLookups();
  }, [open]);

  const reset = () => {
    setStep(0);
    setData({
      workType: "own",
      customer: "",
      name: "",
      delivery: "",
      notes: "",
      materials: [newMaterial()],
      selectedServiceIds: [],
    });
  };

  const totalSheets = data.materials.reduce((s, m) => s + (Number(m.sheets) || 0), 0);

  const addCustomer = async () => {
    if (!newCust.company.trim()) return toast.error("Company name required");
    const { data: row, error } = await supabase
      .from("customers")
      .insert({
        company: newCust.company.trim(),
        contact: newCust.contact.trim() || null,
        phone: newCust.phone.trim() || null,
        address: newCust.address.trim() || null,
        state: newCust.state.trim() || null,
        district: newCust.district.trim() || null,
        pincode: newCust.pincode.trim() || null,
        gstin: newCust.gstin.trim() || null,
      })
      .select("id, company")
      .single();
    if (error) return toast.error(error.message);
    toast.success("Customer added");
    setCustomers((c) => [...c, row as Customer]);
    setData((d) => ({ ...d, customer: row!.company }));
    setNewCust({
      company: "",
      contact: "",
      phone: "",
      address: "",
      state: "",
      district: "",
      pincode: "",
      gstin: "",
    });
    setAdvancedCustomerOpen(false);
    setAddCustOpen(false);
  };

  const create = () => {
    onCreate({
      id: `P${Math.floor(Math.random() * 900 + 100)}`,
      name: data.name || "Untitled project",
      customer: data.customer || "—",
      status: "ongoing",
      progress: 5,
      delivery: data.delivery || "TBD",
      amount: 0,
    });
    toast.success("Project created");
    onOpenChange(false);
    reset();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <ol className="mt-2 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    i < step && "border-primary bg-primary text-primary-foreground",
                    i === step &&
                      "border-primary bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]",
                    i > step && "border-border text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:inline",
                    i === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && <span className="ml-1 h-px flex-1 bg-border" />}
              </li>
            ))}
          </ol>

          <div className="mt-4 min-h-[280px]">
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Work Type</Label>
                  <RadioGroup
                    value={data.workType}
                    onValueChange={(v) => setData({ ...data, workType: v as "own" | "job" })}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-[image:var(--gradient-soft)]">
                      <RadioGroupItem value="own" />
                      <span className="text-sm font-medium">Own Work</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-[image:var(--gradient-soft)]">
                      <RadioGroupItem value="job" />
                      <span className="text-sm font-medium">Job Work</span>
                    </label>
                  </RadioGroup>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Customer</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select
                        value={data.customer}
                        onValueChange={(v) => setData({ ...data, customer: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.company}>
                              {c.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setAddCustOpen(true)}
                      aria-label="Add new customer"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Project Name</Label>
                  <Input
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="e.g. Sterling HQ Cabinets"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery Date</Label>
                  <Input
                    type="date"
                    value={data.delivery}
                    onChange={(e) => setData({ ...data, delivery: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    rows={3}
                    value={data.notes}
                    onChange={(e) => setData({ ...data, notes: e.target.value })}
                    placeholder="Additional details…"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Add one or more materials for this project.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setData((d) => ({ ...d, materials: [...d.materials, newMaterial()] }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add material
                  </Button>
                </div>
                <div className="space-y-2">
                  {data.materials.map((m, idx) => (
                    <div
                      key={m.id}
                      className="grid items-end gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-[1fr_1fr_120px_auto]"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-xs">Material type</Label>
                        <Select
                          value={m.type}
                          onValueChange={(v) =>
                            setData((d) => ({
                              ...d,
                              materials: d.materials.map((x) =>
                                x.id === m.id ? { ...x, type: v } : x,
                              ),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MATERIAL_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Size</Label>
                        <Select
                          value={m.size}
                          onValueChange={(v) =>
                            setData((d) => ({
                              ...d,
                              materials: d.materials.map((x) =>
                                x.id === m.id ? { ...x, size: v } : x,
                              ),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SHEET_SIZES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Sheets</Label>
                        <Input
                          type="number"
                          min={0}
                          value={m.sheets || ""}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              materials: d.materials.map((x) =>
                                x.id === m.id ? { ...x, sheets: Number(e.target.value) } : x,
                              ),
                            }))
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={data.materials.length === 1}
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            materials: d.materials.filter((x) => x.id !== m.id),
                          }))
                        }
                        aria-label={`Remove material ${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-right text-sm text-muted-foreground">
                  Total sheets: <span className="font-semibold text-foreground">{totalSheets}</span>
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Select services required for this project.
                </p>
                {services.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No services configured. Add some in the Services page.
                  </div>
                )}
                {services.map((sv) => {
                  const checked = data.selectedServiceIds.includes(sv.id);
                  return (
                    <label
                      key={sv.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-colors",
                        checked ? "border-primary bg-[image:var(--gradient-soft)]" : "border-border",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) =>
                          setData((d) => ({
                            ...d,
                            selectedServiceIds: c
                              ? [...d.selectedServiceIds, sv.id]
                              : d.selectedServiceIds.filter((id) => id !== sv.id),
                          }))
                        }
                      />
                      <span className="text-sm font-medium">{sv.name}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                  <Row k="Work type" v={data.workType === "own" ? "Own Work" : "Job Work"} />
                  <Row k="Customer" v={data.customer || "—"} />
                  <Row k="Project" v={data.name || "—"} />
                  <Row k="Delivery" v={data.delivery || "—"} />
                  <Row k="Total sheets" v={String(totalSheets)} />
                </div>
                <div className="rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Materials
                  </div>
                  <div className="divide-y divide-border">
                    {data.materials.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between px-4 py-2 text-sm"
                      >
                        <span>
                          {m.type} <span className="text-muted-foreground">({m.size})</span>
                        </span>
                        <span className="font-medium">{m.sheets} sheets</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Selected services
                  </div>
                  <div className="divide-y divide-border">
                    {services
                      .filter((sv) => data.selectedServiceIds.includes(sv.id))
                      .map((sv) => (
                        <div key={sv.id} className="px-4 py-2 text-sm">
                          {sv.name}
                        </div>
                      ))}
                    {data.selectedServiceIds.length === 0 && (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        No services selected
                      </div>
                    )}
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

      {/* Quick add customer */}
      <Dialog open={addCustOpen} onOpenChange={(v) => { setAddCustOpen(v); if (!v) setAdvancedCustomerOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input
                value={newCust.company}
                onChange={(e) => setNewCust({ ...newCust, company: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Contact name</Label>
                <Input
                  value={newCust.contact}
                  onChange={(e) => setNewCust({ ...newCust, contact: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Button
                type="button"
                variant="ghost"
                className="h-auto px-0 text-sm font-medium text-foreground hover:bg-transparent"
                onClick={() => setAdvancedCustomerOpen((v) => !v)}
              >
                Advanced
                <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", advancedCustomerOpen && "rotate-180")} />
              </Button>
            </div>
            {advancedCustomerOpen && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={newCust.address}
                    onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input
                    value={newCust.state}
                    onChange={(e) => setNewCust({ ...newCust, state: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>District</Label>
                  <Input
                    value={newCust.district}
                    onChange={(e) => setNewCust({ ...newCust, district: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pincode</Label>
                  <Input
                    value={newCust.pincode}
                    onChange={(e) => setNewCust({ ...newCust, pincode: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>GSTIN</Label>
                  <Input
                    value={newCust.gstin}
                    onChange={(e) => setNewCust({ ...newCust, gstin: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCustOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCustomer}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
