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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { toast } from "sonner";
import { DEFAULT_EMPLOYEE_ROLE, EMPLOYEE_ROLES } from "@/lib/employee-roles";
import { api } from "@/lib/api";
import { formatDateTimeCompact } from "@/lib/date-format";
import { type StoredStaff } from "@/lib/staff-store";

export const Route = createFileRoute("/dashboard/staff")({
  head: () => ({ meta: [{ title: "Staff Access & Perfomance - Factrova" }] }),
  component: Staff,
});

type StaffRow = StoredStaff;
type ApiStaff = Omit<StaffRow, "access_level"> & { accessLevel: string };

const ROLES = EMPLOYEE_ROLES;
const ACCESS = EMPLOYEE_ROLES;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function formatPerformanceDate(date: Date) {
  return formatDateTimeCompact(date);
}

function Staff() {
  const [list, setList] = useState<StaffRow[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRow | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: DEFAULT_EMPLOYEE_ROLE,
    access_level: DEFAULT_EMPLOYEE_ROLE,
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.list<ApiStaff>("staff");
      setList(
        (data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          role: row.role,
          access_level: row.accessLevel,
          active: row.active,
        })),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load staff");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required for staff login");
    const staff: StaffRow = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      role: form.role,
      access_level: form.access_level,
      active: true,
    };
    try {
      const data = await api.create<ApiStaff>("staff", {
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        accessLevel: staff.access_level,
      });
      await load();
      const staffName = data.name || staff.name;
      toast.success(`${staffName} added and can now sign in with Google`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save staff");
    }
    setOpen(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: DEFAULT_EMPLOYEE_ROLE,
      access_level: DEFAULT_EMPLOYEE_ROLE,
    });
  };

  const toggle = async (s: StaffRow) => {
    try {
      await api.update<ApiStaff>("staff", s.id, { active: !s.active });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update staff");
    }
  };

  const remove = async (id: string) => {
    try {
      await api.remove("staff", id);
      await load();
      toast.success("Removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove staff");
    }
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
  const selectedIndex = selectedStaff ? list.findIndex((s) => s.id === selectedStaff.id) : 0;
  const [selectedYear, selectedMonthNumber] = (selectedMonth || "2026-05").split("-").map(Number);
  const selectedDate = new Date(selectedYear, selectedMonthNumber - 1, 1);
  const month = {
    short: MONTHS[selectedDate.getMonth()],
    days: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate(),
    year: selectedDate.getFullYear(),
  };
  const selectedAssignment = selectedStaff
    ? assignments.find(({ staff }) => staff.id === selectedStaff.id)
    : null;
  const dailyPerformance = Array.from({ length: Math.min(12, month.days) }, (_, index) => {
    const day = Math.min(25, month.days) - index;
    const completed = 3 + (((selectedIndex + 1) * (index + 2) + selectedMonth.length) % 9);
    const date = new Date(month.year, selectedDate.getMonth(), day);
    return {
      date: formatPerformanceDate(date),
      completed,
      status: "Completed",
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
                        <tr
                          key={staff.id}
                          className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/30"
                          onClick={() => setSelectedStaff(staff)}
                        >
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
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {formatDateTimeCompact(lastUpdate)}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
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
                      <th className="px-4 py-3 font-medium">Email</th>
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
                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
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
                          <td className="px-4 py-3 text-muted-foreground">{s.email ?? "-"}</td>
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
                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
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
              <Label>Email ID</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
              />
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
                  {ACCESS.map((access) => (
                    <SelectItem key={access} value={access}>
                      {access}
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

      <Sheet open={!!selectedStaff} onOpenChange={(next) => !next && setSelectedStaff(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-3xl">
          {selectedStaff && (
            <>
              <SheetHeader className="border-b border-border bg-[image:var(--gradient-soft)] px-6 py-5 text-left">
                <SheetTitle>Staff Perfomance</SheetTitle>
                <p className="text-sm font-medium text-muted-foreground">
                  {selectedStaff.name} - {selectedStaff.role}
                </p>
              </SheetHeader>

              <div className="space-y-5 px-6 py-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Current month</p>
                    <p className="mt-1 text-xl font-bold">
                      {selectedAssignment?.currentCompleted ?? 0}
                      <span className="text-sm font-medium text-muted-foreground">
                        {" "}/ {selectedAssignment?.currentEstimated ?? 0}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Last month</p>
                    <p className="mt-1 text-xl font-bold">
                      {selectedAssignment?.lastCompleted ?? 0}
                      <span className="text-sm font-medium text-muted-foreground">
                        {" "}/ {selectedAssignment?.lastEstimated ?? 0}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Last update</p>
                    <p className="mt-1 text-base font-semibold">
                      {selectedAssignment?.lastUpdate
                        ? formatPerformanceDate(new Date(selectedAssignment.lastUpdate))
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="max-w-xs space-y-1.5">
                  <Label htmlFor="performance-month">Month Selection</Label>
                  <Input
                    id="performance-month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value || "2026-05")}
                  />
                </div>

                <Card className="border-border/60 shadow-[var(--shadow-card)]">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Completed Meterial Status</th>
                            <th className="px-4 py-3 text-right font-medium">Count Of Completed Meterial</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyPerformance.map((row) => (
                            <tr key={row.date} className="border-b border-border/50 last:border-0">
                              <td className="px-4 py-3 font-medium">{row.date}</td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary">{row.status}</Badge>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold">{row.completed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
