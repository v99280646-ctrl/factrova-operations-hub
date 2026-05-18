import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, IndianRupee, Wallet, TrendingUp } from "lucide-react";
import { projects, transactions, revenueByMonth } from "@/lib/data";

export const Route = createFileRoute("/dashboard/finance")({
  head: () => ({ meta: [{ title: "Accounts & Finance - Factrova" }] }),
  component: Finance,
});

function Finance() {
  const invoices = projects.map((p, index) => ({
    id: `INV-${String(index + 1).padStart(3, "0")}`,
    date: p.delivery,
    customer: p.customer,
    project: p.name,
    status: p.status === "completed" ? "paid" : p.status === "hold" ? "draft" : "pending",
    amount: p.amount,
  }));
  const credit = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const debit = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const balance = credit - debit;

  const stats = [
    { label: "Total Income", value: credit, icon: ArrowUpRight, tone: "text-success", bg: "bg-success/10" },
    { label: "Total Expense", value: debit, icon: ArrowDownLeft, tone: "text-destructive", bg: "bg-destructive/10" },
    { label: "Net Balance", value: balance, icon: Wallet, tone: "text-primary", bg: "bg-primary/10" },
    { label: "Avg. Monthly Revenue", value: Math.round(revenueByMonth.reduce((s, m) => s + m.revenue, 0) / revenueByMonth.length), icon: TrendingUp, tone: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <DashboardLayout title="Accounts & Finance">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/60 shadow-[var(--shadow-card)]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-2 flex items-center text-2xl font-bold tracking-tight">
                      <IndianRupee className="h-5 w-5" />
                      {s.value.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="sales" className="mt-6">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-base">Invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{invoice.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">{invoice.date}</td>
                        <td className="px-4 py-3">{invoice.customer}</td>
                        <td className="px-4 py-3 text-muted-foreground">{invoice.project}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                            invoice.status === "paid"
                              ? "border-success/20 bg-success/10 text-success"
                              : invoice.status === "pending"
                                ? "border-warning/30 bg-warning/15 text-warning-foreground"
                                : "border-border bg-muted/40 text-muted-foreground"
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          Rs.{invoice.amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-base">Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                        <td className="px-4 py-3 font-medium">{t.desc}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                            t.type === "credit" ? "border-success/20 bg-success/10 text-success" : "border-destructive/20 bg-destructive/10 text-destructive"
                          }`}>
                            {t.type === "credit" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                            {t.type}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${t.type === "credit" ? "text-success" : "text-destructive"}`}>
                          {t.type === "credit" ? "+" : "-"} Rs.{t.amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
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
