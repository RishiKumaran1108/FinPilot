import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getProfile } from "@/lib/store";
import { fmt, expenseBreakdown, totalIncome } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Tv, Music, Film, Play, ShoppingBag, Brain } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/expenses")({
  ssr: false,
  head: () => ({ meta: [{ title: "Expense Analyzer — FinPilot AI" }] }),
  component: ExpensesPage,
});

const SUBSCRIPTIONS = [
  { name: "Netflix", icon: Tv, monthly: 649 },
  { name: "Spotify", icon: Music, monthly: 119 },
  { name: "Prime", icon: Play, monthly: 299 },
  { name: "Hotstar", icon: Film, monthly: 299 },
];

function ExpensesPage() {
  const p = getProfile();
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState(0);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string | null>(null);

  if (!p) return null;

  const pie = expenseBreakdown(p);
  const monthlyTotal = pie.reduce((s, x) => s + x.value, 0);
  const yearSubs = SUBSCRIPTIONS.reduce((s, x) => s + x.monthly, 0) * 12;
  const income = totalIncome(p);

  function evaluate() {
    if (!product || !price) { setVerdict("Enter both a product and price."); return; }
    const monthlySavings = income - monthlyTotal;
    const impactMonths = price / Math.max(1, monthlySavings);
    if (price > p!.savings * 0.5) setVerdict(`At ${fmt(price)}, this would wipe out ${((price / p!.savings) * 100).toFixed(0)}% of your liquid savings. Skip or save up first.`);
    else if (impactMonths > 4) setVerdict(`Costs ${impactMonths.toFixed(1)} months of savings. Consider waiting or buying a cheaper alternative.`);
    else if (impactMonths > 1.5) setVerdict(`Affordable but it'll set back goals by ~${Math.round(impactMonths)} months. Worth it if it's a real need.`);
    else setVerdict(`Comfortably affordable — about ${impactMonths.toFixed(1)} months of your savings rate.`);
  }

  function uploadCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploaded(f.name);
  }

  const insights = [
    `Shopping is ${((p.shopping / Math.max(1, income)) * 100).toFixed(0)}% of your income${p.shopping / income > 0.12 ? " — higher than the 8-12% benchmark." : "."}`,
    `Reducing food delivery by 20% could save ${fmt(p.food * 0.2)} per month.`,
    `Your bills and rent eat ${(((p.rent + p.bills) / Math.max(1, monthlyTotal)) * 100).toFixed(0)}% of monthly outflow — typical for urban India.`,
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Expense Analyzer</h1>
        <p className="text-sm text-muted-foreground">Smart insights from your spending — upload statements or use what we have.</p>
      </div>

      {/* Upload */}
      <div className="glass rounded-2xl p-6 flex flex-wrap items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary"><Upload className="h-5 w-5" /></div>
        <div className="flex-1 min-w-[200px]">
          <div className="font-semibold">Upload CSV or bank statement</div>
          <div className="text-xs text-muted-foreground">{uploaded ? `Loaded: ${uploaded} (demo parse)` : "We'll categorize transactions automatically."}</div>
        </div>
        <label className="cursor-pointer">
          <input type="file" accept=".csv,.pdf" className="hidden" onChange={uploadCsv} />
          <span className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"><FileText className="mr-1 h-4 w-4" /> Choose file</span>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="font-semibold">Category share</h3>
          <div className="h-56 mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={50} outerRadius={80}>
                  {pie.map((p, i) => <Cell key={i} fill={p.color as string} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-semibold">Category breakdown</h3>
          <div className="h-56 mt-2">
            <ResponsiveContainer>
              <BarChart data={pie} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis type="number" stroke="oklch(0.7 0.02 250)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="oklch(0.7 0.02 250)" fontSize={11} width={80} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="value" fill="oklch(0.68 0.2 250)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* AI Insights */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Insights</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {insights.map((i, idx) => <li key={idx} className="flex gap-2"><Badge className="bg-primary/15 text-primary border-0 mt-0.5 shrink-0">AI</Badge> <span>{i}</span></li>)}
          </ul>
        </div>

        {/* Spending Guardian */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-primary" /> AI Spending Guardian</h3>
          <p className="text-xs text-muted-foreground mt-1">Thinking of buying something? Let the AI weigh in.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5"><Label>Product</Label><Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="iPhone 16" /></div>
            <div className="col-span-2 space-y-1.5"><Label>Price (₹)</Label><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} /></div>
          </div>
          <Button className="mt-4" onClick={evaluate}>Evaluate</Button>
          {verdict && <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm">{verdict}</div>}
        </div>
      </div>

      {/* Subscriptions */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Subscription Detector</h3>
          <Badge variant="outline" className="glass">{fmt(yearSubs)} / year</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUBSCRIPTIONS.map((s) => (
            <div key={s.name} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><s.icon className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{fmt(s.monthly)}/mo · {fmt(s.monthly * 12)}/yr</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
