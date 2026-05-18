import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { StatusBadge } from "@/components/status-badge";
import { projects, type Project } from "@/lib/data";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/employee/dashboard")({
  head: () => ({ meta: [{ title: "My Projects - Factrova" }] }),
  component: EmployeeDashboard,
});

type WasteMaterial = {
  type: string;
  size: string;
  note: string;
};

const materialTypes = ["MDF", "Plywood", "Laminate", "Veneer", "Acrylic", "Edge Band", "Hardware"];

function emptyWasteMaterial(): WasteMaterial {
  return {
    type: "MDF",
    size: "",
    note: "",
  };
}

function EmployeeDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [completionCount, setCompletionCount] = useState("");
  const [wasteMaterials, setWasteMaterials] = useState<WasteMaterial[]>([emptyWasteMaterial()]);

  useEffect(() => {
    localStorage.setItem("factrova-login-role", "employee");
  }, []);

  const openProjectUpdate = (project: Project) => {
    setSelectedProject(project);
    setCompletionCount("");
    setWasteMaterials([emptyWasteMaterial()]);
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

  return (
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

      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Update project</DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-5">
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <p className="font-semibold">{selectedProject.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedProject.customer}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Completion Status</Label>
                  <Input value="0/25" readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label>Today's Completion Count</Label>
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
                <div className="flex items-center justify-between gap-3">
                  <Label>Waste Materials</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setWasteMaterials((items) => [...items, emptyWasteMaterial()])}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add waste material
                  </Button>
                </div>

                <div className="space-y-3">
                  {wasteMaterials.map((item, index) => (
                    <div key={index} className="grid gap-3 rounded-lg border border-border/70 p-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
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
                      <div className="space-y-1.5">
                        <Label>Note</Label>
                        <Input
                          value={item.note}
                          onChange={(event) => updateWasteMaterial(index, { note: event.target.value })}
                          placeholder="Note"
                        />
                      </div>
                      <div className="flex items-end">
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
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProject(null)}>Cancel</Button>
            <Button onClick={() => setSelectedProject(null)}>Save update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
