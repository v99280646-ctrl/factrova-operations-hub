import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { MoreVertical, Plus, Trash2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/staff")({
  head: () => ({ meta: [{ title: "Staff Access & Perfomance - Factrova" }] }),
  component: Staff,
});

type StaffRow = {
  id: string;
  name: string;
  phone: string | null;
  role: string;
  access_level: string;
  active: boolean;
};

const ROLES = ["Floor Manager", "Machine Operator", "Accountant", "Sales", "Worker"];
const ACCESS = [
  { v: "admin", label: "Admin (full access)" },
  { v: "manager", label: "Manager" },
  { v: "finance", label: "Finance only" },
  { v: "view", label: "View only" },
];

function Staff() {
  const [list, setList] = useState<StaffRow[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "Worker",
    access_level: "view",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setList((data ?? []) as StaffRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    const { error } = await supabase.from("staff").insert({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      access_level: form.access_level,
    });
    if (error) return toast.error(error.message);
    toast.success("Staff added");
    setOpen(false);
    setForm({ name: "", phone: "", role: "Worker", access_level: "view" });
    load();
  };

  const toggle = async (s: StaffRow) => {
    const { error } = await supabase
      .from("staff")
      .update({ active: !s.active })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const assignments = list.map((staff, index) => {
    return {
      staff,
      currentEstimated: 26 + ((index * 4) % 18),
      currentCompleted: 18 + ((index * 5) % 16),
      lastEstimated: 24 + ((index * 3) % 14),
      lastCompleted: 17 + ((index * 4) % 13),
      lastUpdate: `2026-05-${String(18 - (index % 8)).padStart(2, "0")}`,
    };
  });

  return (
    <DashboardLayout title="Staff Access & Perfomance">
      <Tabs defaultValue="perfomance">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="perfomance">Perfomance</TabsTrigger>
            <TabsTrigger value="manage-access">Manage Access</TabsTrigger>
          </TabsList>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Staff
          </Button>
        </div>

        <TabsContent value="perfomance" className="mt-0">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Staff</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 text-right font-medium">Current Month</th>
                      <th className="px-4 py-3 text-right font-medium">Last Month</th>
                      <th className="px-4 py-3 text-right font-medium">Last Update Date</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      assignments.map(({
                        staff,
                        currentEstimated,
                        currentCompleted,
                        lastEstimated,
                        lastCompleted,
                        lastUpdate,
                      }) => (
                        <tr key={staff.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[image:var(--gradient-soft)] text-primary">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                              {staff.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{staff.role}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold">{currentEstimated}</span>
                            <span className="text-muted-foreground"> / {currentCompleted}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold">{lastEstimated}</span>
                            <span className="text-muted-foreground"> / {lastCompleted}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{lastUpdate}</td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={`Open actions for ${staff.name}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => remove(staff.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    {!loading && assignments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                          No staff assigned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-access" className="mt-0">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Access</th>
                      <th className="px-4 py-3 font-medium">Active</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                          Loading...
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      list.map((s) => (
                        <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[image:var(--gradient-soft)] text-primary">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                              {s.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{s.phone ?? "-"}</td>
                          <td className="px-4 py-3">{s.role}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="capitalize">
                              {s.access_level}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Switch checked={s.active} onCheckedChange={() => toggle(s)} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={`Open actions for ${s.name}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => remove(s.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    {!loading && list.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                          No staff yet.
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add staff member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Access level</Label>
              <Select
                value={form.access_level}
                onValueChange={(v) => setForm({ ...form, access_level: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS.map((a) => (
                    <SelectItem key={a.v} value={a.v}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={add}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
