import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownLeft, ArrowUpRight, IndianRupee, Wallet, TrendingUp } from "lucide-react";
import { transactions, revenueByMonth } from "@/lib/data";

export const Route = createFileRoute("/dashboard/finance")({
  head: () => ({ meta: [{ title: "Accounts & Finance — Factrova" }] }),
  component: Finance,
});

function Finance() {
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
                      <IndianRupee className="h-5 w-5" />{s.value.toLocaleString("en-IN")}
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

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle className="text-base">Monthly revenue</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.015 285)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="oklch(0.5 0.03 280)" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} stroke="oklch(0.5 0.03 280)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.015 285)" }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="oklch(0.52 0.23 287)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle className="text-base">Cash position</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-xl bg-[image:var(--gradient-primary)] p-5 text-primary-foreground shadow-[var(--shadow-elegant)]">
              <p className="text-xs uppercase tracking-wide opacity-80">Available balance</p>
              <p className="mt-2 text-3xl font-bold">₹{balance.toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs opacity-85">As of today</p>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Pending invoices</span><span className="font-medium">₹2,40,000</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Upcoming payouts</span><span className="font-medium">₹85,000</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Tax reserved</span><span className="font-medium">₹62,500</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60 shadow-[var(--shadow-card)]">
        <CardHeader><CardTitle className="text-base">Recent transactions</CardTitle></CardHeader>
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
                      {t.type === "credit" ? "+" : "−"} ₹{t.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
