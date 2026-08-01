import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getProfile } from "@/lib/store";
import { fmt, healthScore, monthlySavings, simulate, totalIncome, totalExpenses, type Scenario } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, Briefcase, Car, Home, Heart, GraduationCap, Rocket, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/_app/financial-twin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Financial Twin — FinPilot AI" }] }),
  component: TwinPage,
});

const SCENARIOS: { id: Scenario; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "salary_increase", label: "Salary Increase", icon: ArrowUp, desc: "Promotion or new offer" },
  { id: "job_loss", label: "Job Loss", icon: Briefcase, desc: "Layoff or career break" },
  { id: "car_loan", label: "Car Loan", icon: Car, desc: "Finance a new car" },
  { id: "home_loan", label: "Home Loan", icon: Home, desc: "Buy your own place" },
  { id: "marriage", label: "Marriage", icon: Heart, desc: "Wedding expenses" },
  { id: "higher_education", label: "Higher Education", icon: GraduationCap, desc: "MBA or Master's" },
  { id: "startup", label: "Launch Startup", icon: Rocket, desc: "Go all-in on your idea" },
];

function TwinPage() {
  const p = getProfile();
  const [scenario, setScenario] = useState<Scenario>("car_loan");
  const [intensity, setIntensity] = useState(1);

  if (!p) return null;

  const sim = useMemo(() => simulate(p, scenario, intensity), [p, scenario, intensity]);
  const current = healthScore(p);
  const future = healthScore(sim.profile);
  const curSave = monthlySavings(p);
  const futSave = monthlySavings(sim.profile);
  const delta = future.score - current.score;

  const projection = useMemo(() => {
    const months = 24;
    const data: { month: string; current: number; future: number }[] = [];
    let cur = p.savings; let fut = sim.profile.savings;
    for (let i = 0; i < months; i++) {
      cur += curSave; fut += futSave;
      data.push({ month: `M${i + 1}`, current: Math.max(0, Math.round(cur)), future: Math.max(0, Math.round(fut)) });
    }
    return data;
  }, [p, sim, curSave, futSave]);

  const risk = delta > 5 ? "Improves" : delta < -10 ? "High Risk" : delta < 0 ? "Moderate Risk" : "Neutral";
  const riskColor = delta > 5 ? "text-success" : delta < -10 ? "text-destructive" : delta < 0 ? "text-warning" : "text-muted-foreground";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary"><Brain className="h-3.5 w-3.5" /> Flagship</div>
          <h1 className="mt-3 font-display text-3xl font-bold">Financial Twin</h1>
          <p className="text-sm text-muted-foreground">Test major life decisions before living them.</p>
        </div>
        <Badge className={`glass ${riskColor}`}>Risk · {risk}</Badge>
      </div>

      {/* Scenario picker */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {SCENARIOS.map((s) => {
          const active = scenario === s.id;
          return (
            <button key={s.id} onClick={() => setScenario(s.id)}
              className={`glass rounded-xl p-4 text-left transition hover:-translate-y-0.5 ${active ? "ring-2 ring-primary shadow-[var(--shadow-glow)]" : ""}`}>
              <s.icon className={`h-5 w-5 mb-2 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Intensity</h3>
            <p className="text-xs text-muted-foreground">{sim.note}</p>
          </div>
          <span className="text-sm text-primary font-medium">{(intensity * 100).toFixed(0)}%</span>
        </div>
        <Slider min={0.25} max={2} step={0.25} value={[intensity]} onValueChange={(v) => setIntensity(v[0])} className="mt-4" />
      </div>

      {/* Before vs After */}
      <div className="grid gap-4 md:grid-cols-2">
        <Compare title="Current" tone="current" score={current.score} savings={p.savings} monthly={curSave} income={totalIncome(p)} expenses={totalExpenses(p)} />
        <Compare title="With Scenario" tone="future" score={future.score} savings={sim.profile.savings} monthly={futSave} income={totalIncome(sim.profile)} expenses={totalExpenses(sim.profile)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Delta label="Score Δ" current={current.score} future={future.score} />
        <Delta label="Monthly Savings Δ" current={curSave} future={futSave} format="money" />
        <Delta label="Liquid Savings Δ" current={p.savings} future={sim.profile.savings} format="money" />
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold">24-Month Projection</h3>
        <div className="h-72 mt-3">
          <ResponsiveContainer>
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="month" stroke="oklch(0.7 0.02 250)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="current" name="Current path" stroke="oklch(0.72 0.18 155)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="future" name="With scenario" stroke="oklch(0.68 0.2 250)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <h3 className="font-semibold">AI Verdict</h3>
        <p className="mt-2 text-sm">
          {delta < -10 && `This is a high-risk move. Your score drops from ${current.score} to ${future.score}. Consider reducing exposure or building reserves first.`}
          {delta >= -10 && delta < 0 && `Manageable but tight. Score moves from ${current.score} to ${future.score}. Adjust discretionary spending to absorb it.`}
          {delta >= 0 && delta <= 5 && `Roughly neutral. Score stays around ${future.score}. Safe to proceed if it aligns with your goals.`}
          {delta > 5 && `Net positive. Your score rises from ${current.score} to ${future.score}. Strong move for long-term wealth.`}
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="glass" onClick={() => setIntensity(1)}>Reset</Button>
        </div>
      </div>
    </div>
  );
}

function Compare({ title, tone, score, savings, monthly, income, expenses }: { title: string; tone: "current" | "future"; score: number; savings: number; monthly: number; income: number; expenses: number }) {
  const accent = tone === "current" ? "border-success/40" : "border-primary/40";
  return (
    <div className={`glass rounded-2xl p-6 border ${accent}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <Badge variant="outline" className="text-xs">{tone === "current" ? "Baseline" : "Simulated"}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Stat label="Health Score" value={`${score}`} />
        <Stat label="Monthly Savings" value={fmt(monthly)} />
        <Stat label="Liquid Savings" value={fmt(savings)} />
        <Stat label="Income → Expenses" value={`${fmt(income)} → ${fmt(expenses)}`} small />
      </div>
    </div>
  );
}
function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-bold ${small ? "text-sm" : "text-2xl"}`}>{value}</div>
    </div>
  );
}
function Delta({ label, current, future, format }: { label: string; current: number; future: number; format?: "money" }) {
  const diff = future - current;
  const Icon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus;
  const color = diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-muted-foreground";
  const display = format === "money" ? fmt(Math.abs(diff)) : Math.abs(diff).toFixed(0);
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 flex items-center gap-2 font-display text-2xl font-bold ${color}`}>
        <Icon className="h-5 w-5" /> {display}
      </div>
    </div>
  );
}
