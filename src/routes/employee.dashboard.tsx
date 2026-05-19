import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { projects, type Project } from "@/lib/data";
import { CalendarDays, LogOut, MoreVertical, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/employee/dashboard")({
  head: () => ({ meta: [{ title: "My Projects - Factrova" }] }),
  component: EmployeeDashboard,
});

type WasteMaterial = {
  type: string;
  size: string;
  note: string;
};
type WasteMaterialMode = "create" | "use";
type ExistingWasteMaterial = {
  id: string;
  type: string;
  size: string;
  available: number;
};

const materialTypes = ["MDF", "Plywood", "Laminate", "Veneer", "Acrylic", "Edge Band", "Hardware"];
const existingWasteMaterials: ExistingWasteMaterial[] = [
  { id: "WM-001", type: "Plywood offcut", size: "18mm - 2 x 3 ft", available: 6 },
  { id: "WM-002", type: "Veneer strip", size: "4 in x 8 ft", available: 12 },
  { id: "WM-003", type: "MDF trimming", size: "18mm - mixed", available: 18 },
  { id: "WM-004", type: "Edge band scrap", size: "Walnut - short rolls", available: 9 },
];

function emptyWasteMaterial(): WasteMaterial {
  return {
    type: "MDF",
    size: "",
    note: "",
  };
}

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [employeeName, setEmployeeName] = useState("Anoop K");
  const [employeePosition, setEmployeePosition] = useState("Cutting Mechine");
  const [completionCount, setCompletionCount] = useState("");
  const [hasWasteMaterials, setHasWasteMaterials] = useState(false);
  const [wasteMaterialMode, setWasteMaterialMode] = useState<WasteMaterialMode>("create");
  const [wasteMaterials, setWasteMaterials] = useState<WasteMaterial[]>([emptyWasteMaterial()]);
  const [wasteMaterialSearch, setWasteMaterialSearch] = useState("");
  const [selectedWasteMaterialIds, setSelectedWasteMaterialIds] = useState<string[]>([]);

  const filteredWasteMaterials = existingWasteMaterials.filter((item) =>
    [item.id, item.type, item.size]
      .join(" ")
      .toLowerCase()
      .includes(wasteMaterialSearch.toLowerCase()),
  );

  useEffect(() => {
    localStorage.setItem("factrova-login-role", "employee");
    setEmployeeName(localStorage.getItem("factrova-employee-name") || "Anoop K");
    setEmployeePosition(localStorage.getItem("factrova-employee-position") || "Cutting Mechine");
  }, []);

  const openProjectUpdate = (project: Project) => {
    setSelectedProject(project);
    setCompletionCount("");
    setHasWasteMaterials(false);
    setWasteMaterialMode("create");
    setWasteMaterials([emptyWasteMaterial()]);
    setWasteMaterialSearch("");
    setSelectedWasteMaterialIds([]);
  };

  const updateWasteMaterial = (index: number, updates: Partial<WasteMaterial>) => {
    setWasteMaterials((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    );
  };

  const removeWasteMaterial = (index: number) => {
    setWasteMaterials((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  const toggleExistingWasteMaterial = (id: string, checked: boolean) => {
    setSelectedWasteMaterialIds((items) =>
      checked ? [...items, id] : items.filter((item) => item !== id),
    );
  };

  const logout = () => {
    localStorage.removeItem("factrova-login-role");
    localStorage.removeItem("factrova-employee-name");
    localStorage.removeItem("factrova-employee-position");
    navigate({ to: "/" });
  };

  return (
    <>
      <div className="min-h-screen bg-muted/30 md:hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-base font-semibold leading-tight">{employeeName}</p>
            <p className="text-xs text-muted-foreground">{employeePosition}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Employee menu">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="space-y-4 p-4">
          <div className="space-y-3">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => openProjectUpdate(project)}
                className="w-full rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{project.name}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Progress</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-md bg-muted/45 px-3 py-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Completion</span>
                    <span className="ml-2 font-semibold text-foreground">15/25</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {project.delivery}
                    </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      <div className="hidden md:block">
        <DashboardLayout title="My Projects" role="employee">
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
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openProjectUpdate(project)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openProjectUpdate(project);
                          }
                        }}
                        className="cursor-pointer border-b border-border/50 outline-none last:border-0 hover:bg-muted/30 focus:bg-muted/40"
                      >
                        <td className="px-4 py-3 font-medium">{project.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{project.customer}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={project.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{project.delivery}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </DashboardLayout>
      </div>

      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="bottom-0 left-0 right-0 top-auto flex max-h-[92dvh] max-w-none !translate-x-0 !translate-y-0 flex-col overflow-hidden rounded-b-none rounded-t-2xl p-0 duration-300 data-[state=closed]:!slide-out-to-bottom data-[state=closed]:!slide-out-to-left-0 data-[state=closed]:!slide-out-to-top-0 data-[state=closed]:!zoom-out-100 data-[state=open]:!slide-in-from-bottom data-[state=open]:!slide-in-from-left-0 data-[state=open]:!slide-in-from-top-0 data-[state=open]:!zoom-in-100 sm:left-[50%] sm:right-auto sm:top-auto sm:max-w-3xl sm:!translate-x-[-50%]">
          <DialogHeader className="shrink-0 border-b border-border bg-[image:var(--gradient-soft)] px-6 py-4 text-left">
            <DialogTitle>Update project</DialogTitle>
            {selectedProject && (
              <p className="text-sm font-medium text-muted-foreground">{selectedProject.name}</p>
            )}
          </DialogHeader>

          {selectedProject && (
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label>Completion Status</Label>
                  <Input value="0/25" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label>Today's Completions</Label>
                  <Input
                    type="number"
                    min={0}
                    value={completionCount}
                    onChange={(event) => setCompletionCount(event.target.value)}
                    placeholder="Enter count"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Checkbox
                    id="has-waste-materials"
                    checked={hasWasteMaterials}
                    onCheckedChange={(value) => setHasWasteMaterials(Boolean(value))}
                  />
                  <Label htmlFor="has-waste-materials">Waste Materials</Label>
                </div>

                {hasWasteMaterials && (
                  <Tabs
                    value={wasteMaterialMode}
                    onValueChange={(value) => setWasteMaterialMode(value as WasteMaterialMode)}
                  >
                    <div className="flex items-center gap-2">
                      <TabsList className="grid flex-1 grid-cols-2">
                        <TabsTrigger value="create">Create waste</TabsTrigger>
                        <TabsTrigger value="use">Use waste</TabsTrigger>
                      </TabsList>
                      <Button
                        type="button"
                        size="icon"
                        className="border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white"
                        onClick={() => {
                          setWasteMaterialMode("create");
                          setWasteMaterials((items) => [...items, emptyWasteMaterial()]);
                        }}
                        aria-label="Add waste"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                  <TabsContent value="create" className="space-y-3">
                      {wasteMaterials.map((item, index) => (
                        <div key={index} className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 p-3">
                          <div className="space-y-1.5">
                            <Label>Material Type</Label>
                            <Select value={item.type} onValueChange={(value) => updateWasteMaterial(index, { type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {materialTypes.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Size</Label>
                            <Input
                              value={item.size}
                              onChange={(event) => updateWasteMaterial(index, { size: event.target.value })}
                              placeholder="Size"
                            />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <Label>Note</Label>
                            <Input
                              value={item.note}
                              onChange={(event) => updateWasteMaterial(index, { note: event.target.value })}
                              placeholder="Note"
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeWasteMaterial(index)}
                              disabled={wasteMaterials.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="use" className="space-y-3">
                      <Input
                        value={wasteMaterialSearch}
                        onChange={(event) => setWasteMaterialSearch(event.target.value)}
                        placeholder="Search waste materials"
                      />
                      <div className="overflow-hidden rounded-lg border border-border/70">
                        <div className="grid grid-cols-[48px_1fr_1fr_90px] border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <span />
                          <span>Material</span>
                          <span>Size</span>
                          <span className="text-right">Available</span>
                        </div>
                        {filteredWasteMaterials.map((item) => {
                          const checked = selectedWasteMaterialIds.includes(item.id);
                          return (
                            <label
                              key={item.id}
                              className="grid cursor-pointer grid-cols-[48px_1fr_1fr_90px] items-center border-b border-border/60 px-3 py-3 text-sm last:border-0 hover:bg-muted/30"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => toggleExistingWasteMaterial(item.id, Boolean(value))}
                              />
                              <span className="font-medium">{item.type}</span>
                              <span className="text-muted-foreground">{item.size}</span>
                              <span className="text-right font-medium">{item.available}</span>
                            </label>
                          );
                        })}
                        {filteredWasteMaterials.length === 0 && (
                          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No waste materials found.
                          </div>
                        )}
                      </div>
                  </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="sticky bottom-0 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-background px-6 py-4 sm:grid-cols-2">
            <Button variant="outline" onClick={() => setSelectedProject(null)}>Cancel</Button>
            <Button onClick={() => setSelectedProject(null)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
