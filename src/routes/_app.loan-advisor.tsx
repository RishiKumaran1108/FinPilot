import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getProfile } from "@/lib/store";
import { fmt, loanAdvice, totalIncome } from "@/lib/finance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/_app/loan-advisor")({
  ssr: false,
  head: () => ({ meta: [{ title: "Loan Advisor — FinPilot AI" }] }),
  component: LoanAdvisor,
});

function LoanAdvisor() {
  const p = getProfile();
  const [amount, setAmount] = useState(500000);
  const [tenure, setTenure] = useState(36);
  const [rate, setRate] = useState(10.5);

  if (!p) return null;

  const result = useMemo(() => loanAdvice(p, amount, tenure, rate / 100), [p, amount, tenure, rate]);
  const burdenPct = Math.min(100, result.burden * 100);
  const verdict = result.risk === "High" ? "Skip or reduce" : result.risk === "Moderate" ? "Possible with caution" : "Comfortably affordable";
  const tone = result.risk === "High" ? "text-destructive" : result.risk === "Moderate" ? "text-warning" : "text-success";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Wallet className="h-7 w-7 text-primary" /> Loan Advisor</h1>
        <p className="text-sm text-muted-foreground">Should you take this loan? Based on your real income and EMIs.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-1 space-y-4">
          <h3 className="font-semibold">Loan inputs</h3>
          <div className="space-y-1.5"><Label>Amount (₹)</Label><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} /></div>
          <div className="space-y-1.5"><Label>Tenure (months)</Label><Input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value) || 1)} /></div>
          <div className="space-y-1.5"><Label>Interest rate (%)</Label><Input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} /></div>
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            Your income: <span className="text-foreground">{fmt(totalIncome(p))}</span> · Existing EMI: <span className="text-foreground">{fmt(p.emi)}</span>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Verdict</h3>
            <Badge className={`glass ${tone}`}>{result.risk} risk · {verdict}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI label="New EMI" value={fmt(result.emi)} />
            <KPI label="Total EMI burden" value={`${burdenPct.toFixed(0)}%`} />
            <KPI label="Approval probability" value={`${result.approvalProb}%`} />
            <KPI label="Loan amount" value={fmt(amount)} />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">EMI as % of income</span>
              <span className={tone}>{burdenPct.toFixed(0)}%</span>
            </div>
            <Progress value={burdenPct} className="h-2" />
            <div className="mt-2 text-xs text-muted-foreground">Safe zone: under 35%. Danger zone: over 50%.</div>
          </div>
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm">
            <strong className="text-primary">AI Note: </strong>
            {result.risk === "High" && "This pushes your EMI past 50% of income. Consider a smaller loan, longer tenure, or building income first."}
            {result.risk === "Moderate" && "Manageable but tight. Build a 3-month emergency buffer before committing."}
            {result.risk === "Low" && "You can comfortably absorb this. Consider prepaying when bonuses arrive to save on interest."}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
    </div>
  );
}
