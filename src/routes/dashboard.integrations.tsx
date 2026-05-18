import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Factrova" }] }),
  component: Integrations,
});

type Integration = {
  id: string;
  name: string;
  description: string | null;
  status: string;
};

const hiddenIntegrations = new Set(["Google Drive", "Shiprocket", "Tally ERP"]);

function Integrations() {
  const [list, setList] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .order("name");
    if (error) toast.error(error.message);
    else setList(((data ?? []) as Integration[]).filter((i) => !hiddenIntegrations.has(i.name)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (i: Integration) => {
    const next = i.status === "connected" ? "disconnected" : "connected";
    const { error } = await supabase
      .from("integrations")
      .update({ status: next })
      .eq("id", i.id);
    if (error) return toast.error(error.message);
    toast.success(next === "connected" ? `${i.name} connected` : `${i.name} disconnected`);
    load();
  };

  return (
    <DashboardLayout title="Integrations">
      <p className="mb-4 text-sm text-muted-foreground">
        Connect Factrova with the tools you already use.
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((i) => {
            const connected = i.status === "connected";
            return (
              <Card key={i.id} className="border-border/60 shadow-[var(--shadow-card)]">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[image:var(--gradient-soft)] text-primary">
                      <Plug className="h-5 w-5" />
                    </div>
                    {connected ? (
                      <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not connected</Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold">{i.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
                  </div>
                  <Button
                    variant={connected ? "outline" : "default"}
                    className="w-full"
                    onClick={() => toggle(i)}
                  >
                    {connected ? "Disconnect" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
