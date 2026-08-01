import { createFileRoute } from "@tanstack/react-router";
import { getProfile } from "@/lib/store";
import { fmt, totalIncome, totalExpenses, monthlySavings, healthScore, savingsForecast, emergencyMonths, savingsRate, debtRatio } from "@/lib/finance";
import { Badge } from "@/components/ui/badge";
import { FileBarChart } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/reports")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reports — FinPilot AI" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const p = getProfile();
  if (!p) return null;
  const h = healthScore(p);
  const data = savingsForecast(p, 24);

  const rows = [
    { metric: "Savings Rate", value: `${(savingsRate(p) * 100).toFixed(1)}%`, benchmark: "20%+" },
    { metric: "Debt Ratio", value: `${(debtRatio(p) * 100).toFixed(1)}%`, benchmark: "< 35%" },
    { metric: "Emergency Months", value: emergencyMonths(p).toFixed(1), benchmark: "6+" },
    { metric: "Expense / Income", value: `${((totalExpenses(p) / Math.max(1, totalIncome(p))) * 100).toFixed(0)}%`, benchmark: "< 70%" },
    { metric: "Investments / Salary", value: `${(p.investments / Math.max(1, p.salary)).toFixed(1)}x`, benchmark: "6x+" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><FileBarChart className="h-7 w-7 text-primary" /> Reports</h1>
        <p className="text-sm text-muted-foreground">A snapshot of your financial position, benchmarks and trajectory.</p>
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold">Financial Health Report</h3>
            <p className="text-sm text-muted-foreground mt-1">{h.summary}</p>
          </div>
          <Badge className="glass text-base px-4 py-1.5">{h.score}/100 · {h.grade}</Badge>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Key metrics</h3>
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.metric} className="flex items-center justify-between py-3 text-sm">
              <span className="text-muted-foreground">{r.metric}</span>
              <div className="flex items-center gap-4">
                <span className="font-display font-bold">{r.value}</span>
                <Badge variant="outline" className="text-xs">target {r.benchmark}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold">24-Month Savings Trajectory</h3>
        <div className="h-72 mt-3">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="month" stroke="oklch(0.7 0.02 250)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
              <Line type="monotone" dataKey="savings" stroke="oklch(0.68 0.2 250)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Income / month" value={fmt(totalIncome(p))} />
        <Stat label="Expenses / month" value={fmt(totalExpenses(p))} />
        <Stat label="Savings / month" value={fmt(monthlySavings(p))} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
