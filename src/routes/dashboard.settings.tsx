import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ImagePlus, Lock, Save, UserRound } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings - Factrova" }] }),
  component: Settings,
});

function Settings() {
  return (
    <DashboardLayout title="Settings">
      <Tabs defaultValue="admin-profile" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-1 sm:w-auto sm:grid-cols-3">
          <TabsTrigger value="admin-profile">Admin Profile</TabsTrigger>
          <TabsTrigger value="company-profile">Company Profile</TabsTrigger>
          <TabsTrigger value="password-settings">Password Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="admin-profile" className="mt-0">
          <SettingsPanel title="Admin Profile" icon={<UserRound className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name" value="Admin" />
              <Field label="Role" value="Administrator" />
              <Field label="Phone" value="9876543210" />
              <Field label="Email" type="email" value="admin@factrova.in" />
              <Field label="City" value="Ahmedabad" />
              <Field label="State" value="Gujarat" />
              <Field label="Pincode" value="380001" />
              <Field label="Profile Logo" type="file" />
            </div>
            <AddressField label="Address" value="Factrova Operations Office" />
            <FormActions />
          </SettingsPanel>
        </TabsContent>

        <TabsContent value="company-profile" className="mt-0">
          <SettingsPanel title="Company Profile" icon={<Building2 className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company Name" value="Factrova" />
              <Field label="GSTIN" value="" />
              <Field label="Phone" value="9876543210" />
              <Field label="Email" type="email" value="accounts@factrova.in" />
              <Field label="City" value="Ahmedabad" />
              <Field label="State" value="Gujarat" />
              <Field label="Pincode" value="380001" />
              <LogoField />
            </div>
            <AddressField label="Address" value="Factory Operations, Industrial Area" />
            <FormActions />
          </SettingsPanel>
        </TabsContent>

        <TabsContent value="password-settings" className="mt-0">
          <SettingsPanel title="Password Settings" icon={<Lock className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Current Password" type="password" value="" />
              <Field label="New Password" type="password" value="" />
              <Field label="Confirm Password" type="password" value="" />
            </div>
            <FormActions />
          </SettingsPanel>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function SettingsPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[image:var(--gradient-soft)] text-primary">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  type = "text",
}: {
  label: string;
  value?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} defaultValue={value} />
    </div>
  );
}

function AddressField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea defaultValue={value} rows={4} />
    </div>
  );
}

function LogoField() {
  return (
    <div className="space-y-1.5">
      <Label>Logo</Label>
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <ImagePlus className="h-5 w-5" />
        </div>
        <Input type="file" accept="image/*" />
      </div>
    </div>
  );
}

function FormActions() {
  return (
    <div className="flex justify-end border-t border-border/70 pt-4">
      <Button>
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>
    </div>
  );
}
