import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { getProfile } from "@/lib/store";
import { fmt, totalIncome, totalExpenses, monthlySavings, healthScore, emergencyMonths, emergencyTarget, recommendations, expenseBreakdown, savingsForecast } from "@/lib/finance";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Wallet, PiggyBank, Activity, Sparkles, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — FinPilot AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const p = getProfile();
  if (!p) return null;

  const h = useMemo(() => healthScore(p), [p]);
  const income = totalIncome(p);
  const exp = totalExpenses(p);
  const save = monthlySavings(p);
  const em = emergencyMonths(p);
  const emT = emergencyTarget(p);
  const recs = recommendations(p);
  const pie = expenseBreakdown(p);
  const forecast = savingsForecast(p);
  const trend = forecast.slice(0, 6).map((f, i) => ({ month: f.month, expense: Math.round(exp * (0.9 + i * 0.04)), income }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Hello, {p.fullName.split(" ")[0] || "there"} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's your financial snapshot for this month.</p>
        </div>
        <Badge variant="outline" className="glass">Risk · {p.risk}</Badge>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI label="Financial Health" value={`${h.score}`} suffix={`/100 · ${h.grade}`} icon={Activity} accent="text-primary" />
        <KPI label="Monthly Income" value={fmt(income)} icon={TrendingUp} accent="text-success" />
        <KPI label="Monthly Expenses" value={fmt(exp)} icon={Wallet} accent="text-warning" />
        <KPI label="Monthly Savings" value={fmt(save)} icon={PiggyBank} accent="text-primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Health card */}
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Financial Health</h3>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 flex items-center gap-6">
            <ScoreRing score={h.score} />
            <div>
              <div className="text-3xl font-display font-bold">{h.grade}</div>
              <div className="text-xs text-muted-foreground mt-1 max-w-[180px]">{h.summary}</div>
            </div>
          </div>
        </div>

        {/* Emergency fund */}
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="font-semibold">Emergency Fund</h3>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="font-display text-2xl font-bold">{fmt(p.savings)}</div>
            <div className="text-xs text-muted-foreground">target {fmt(emT)}</div>
          </div>
          <Progress className="mt-3 h-2" value={Math.min(100, (p.savings / Math.max(1, emT)) * 100)} />
          <div className="mt-3 text-xs text-muted-foreground">Covers <span className="text-foreground font-medium">{em.toFixed(1)} months</span> of expenses</div>
        </div>

        {/* AI Recs */}
        <div className="glass-strong rounded-2xl p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">AI Recommendations</h3>
            <Badge className="bg-primary/20 text-primary border-0">Live</Badge>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {recs.map((r, i) => (
              <li key={i} className="flex gap-2"><ArrowUpRight className="h-4 w-4 mt-0.5 text-primary shrink-0" /><span>{r}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Expense pie */}
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="font-semibold">Expense Breakdown</h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pie.map((p, i) => <Cell key={i} fill={p.color as string} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {pie.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color as string }} /> {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Trend */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-semibold">Monthly Trend</h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="month" stroke="oklch(0.7 0.02 250)" fontSize={12} />
                <YAxis stroke="oklch(0.7 0.02 250)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="income" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Forecast + Goals */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-semibold">12-Month Savings Forecast</h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.2 250)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.68 0.2 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="month" stroke="oklch(0.7 0.02 250)" fontSize={12} />
                <YAxis stroke="oklch(0.7 0.02 250)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
                <Area type="monotone" dataKey="savings" stroke="oklch(0.68 0.2 250)" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Current Goals</h3>
            <Link to="/goals" className="text-xs text-primary hover:underline">Manage</Link>
          </div>
          <ul className="mt-4 space-y-4">
            {p.goals.length === 0 && <li className="text-sm text-muted-foreground">No goals yet. <Link to="/goals" className="text-primary hover:underline">Add one</Link>.</li>}
            {p.goals.slice(0, 4).map((g) => {
              const pct = Math.min(100, (save * 6) / g.targetAmount * 100);
              return (
                <li key={g.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-primary" /> {g.name}</span>
                    <span className="text-xs text-muted-foreground">{fmt(g.targetAmount)}</span>
                  </div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, suffix, icon: Icon, accent }: { label: string; value: string; suffix?: string; icon: React.ElementType; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent ?? "text-primary"}`} />
      </div>
      <div className="mt-3 font-display text-3xl font-bold">
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} stroke="oklch(1 0 0 / 0.08)" strokeWidth="10" fill="none" />
        <circle
          cx="55" cy="55" r={radius}
          stroke="url(#grad)" strokeWidth="10" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 55 55)"
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.22 270)" />
            <stop offset="100%" stopColor="oklch(0.68 0.2 250)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="font-display text-2xl font-bold">{score}</div>
      </div>
    </div>
  );
}
