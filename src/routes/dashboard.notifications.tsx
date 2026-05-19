import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications - Factrova" }] }),
  component: Notifications,
});

const adminOptions = [
  "Project onboarding",
  "Project completion",
  "Daily reports",
];

const customerOptions = [
  "Project status",
  "Invoice",
];

function Notifications() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    "Project onboarding": true,
    "Project completion": true,
    "Daily reports": true,
    "Project status": true,
    Invoice: true,
  });

  const toggle = (label: string) => {
    setSettings((current) => ({ ...current, [label]: !current[label] }));
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="grid gap-4 lg:grid-cols-2">
        <NotificationSection
          title="Admin Level"
          icon={Bell}
          options={adminOptions}
          settings={settings}
          onToggle={toggle}
        />
        <NotificationSection
          title="Customers"
          icon={Users}
          options={customerOptions}
          settings={settings}
          onToggle={toggle}
        />
      </div>
    </DashboardLayout>
  );
}

function NotificationSection({
  title,
  icon: Icon,
  options,
  settings,
  onToggle,
}: {
  title: string;
  icon: typeof Bell;
  options: string[];
  settings: Record<string, boolean>;
  onToggle: (label: string) => void;
}) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[image:var(--gradient-soft)] text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {options.map((option) => (
            <div key={option} className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="text-sm font-medium">{option}</span>
              <Switch checked={settings[option]} onCheckedChange={() => onToggle(option)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
