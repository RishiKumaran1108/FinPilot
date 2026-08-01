import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { getAuth, saveProfile, type Profile, type Goal } from "@/lib/store";
import { aiSummary, healthScore, emergencyMonths, fmt } from "@/lib/finance";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({ meta: [{ title: "Onboarding — FinPilot AI" }] }),
  component: Onboarding,
});

const DEFAULT_GOALS = ["Buy Bike", "Buy Car", "Vacation", "Marriage", "House", "Education"];

const steps = ["Personal", "Income", "Expenses", "Savings", "Loans", "Goals", "Risk", "Summary"];

function Onboarding() {
  const nav = useNavigate();
  const auth = getAuth();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>({
    fullName: auth?.name ?? "",
    email: auth?.email ?? "",
    age: 26, occupation: "", city: "",
    salary: 40000, otherIncome: 0,
    rent: 12000, food: 6000, shopping: 4000, transport: 2500, entertainment: 2000, bills: 2500,
    savings: 150000, investments: 50000, fixedDeposits: 0,
    existingLoans: 0, emi: 0,
    goals: [],
    risk: "Moderate",
    createdAt: new Date().toISOString(),
  });
  const [customGoal, setCustomGoal] = useState("");

  function update<K extends keyof Profile>(k: K, v: Profile[K]) { setP((s) => ({ ...s, [k]: v })); }

  function toggleGoal(name: string) {
    setP((s) => {
      const exists = s.goals.find((g) => g.name === name);
      if (exists) return { ...s, goals: s.goals.filter((g) => g.name !== name) };
      const defaults: Record<string, { amt: number; months: number }> = {
        "Buy Bike": { amt: 150000, months: 18 },
        "Buy Car": { amt: 800000, months: 36 },
        "Vacation": { amt: 100000, months: 12 },
        "Marriage": { amt: 1000000, months: 36 },
        "House": { amt: 5000000, months: 60 },
        "Education": { amt: 1500000, months: 24 },
      };
      const d = defaults[name] ?? { amt: 200000, months: 24 };
      const goal: Goal = { id: crypto.randomUUID(), name, targetAmount: d.amt, targetMonths: d.months };
      return { ...s, goals: [...s.goals, goal] };
    });
  }

  function addCustomGoal() {
    if (!customGoal.trim()) return;
    setP((s) => ({ ...s, goals: [...s.goals, { id: crypto.randomUUID(), name: customGoal.trim(), targetAmount: 100000, targetMonths: 12 }] }));
    setCustomGoal("");
  }

  function finish() {
    saveProfile(p);
    toast.success("Profile created. Welcome aboard.");
    nav({ to: "/dashboard" });
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
          <div>
            <div className="font-display text-lg font-bold">Financial Onboarding</div>
            <div className="text-xs text-muted-foreground">Step {step + 1} of {steps.length} · {steps[step]}</div>
          </div>
        </div>
        <Progress value={progress} className="mb-6 h-1.5" />

        <div className="glass-strong rounded-2xl p-8 min-h-[420px]">
          {step === 0 && (
            <Section title="Tell us about you" desc="The basics so we can tailor advice.">
              <Grid>
                <Num label="Age" value={p.age} onChange={(v) => update("age", v)} />
                <Field label="Occupation"><Input value={p.occupation} onChange={(e) => update("occupation", e.target.value)} placeholder="Software Engineer" /></Field>
                <Field label="City"><Input value={p.city} onChange={(e) => update("city", e.target.value)} placeholder="Bengaluru" /></Field>
              </Grid>
            </Section>
          )}
          {step === 1 && (
            <Section title="Income" desc="How much comes in each month?">
              <Grid>
                <Num label="Monthly Salary (₹)" value={p.salary} onChange={(v) => update("salary", v)} />
                <Num label="Other Income (₹)" value={p.otherIncome} onChange={(v) => update("otherIncome", v)} />
              </Grid>
            </Section>
          )}
          {step === 2 && (
            <Section title="Expenses" desc="A rough monthly breakdown.">
              <Grid>
                <Num label="Rent (₹)" value={p.rent} onChange={(v) => update("rent", v)} />
                <Num label="Food (₹)" value={p.food} onChange={(v) => update("food", v)} />
                <Num label="Shopping (₹)" value={p.shopping} onChange={(v) => update("shopping", v)} />
                <Num label="Transport (₹)" value={p.transport} onChange={(v) => update("transport", v)} />
                <Num label="Entertainment (₹)" value={p.entertainment} onChange={(v) => update("entertainment", v)} />
                <Num label="Bills (₹)" value={p.bills} onChange={(v) => update("bills", v)} />
              </Grid>
            </Section>
          )}
          {step === 3 && (
            <Section title="Savings & investments" desc="What's already working for you.">
              <Grid>
                <Num label="Current Savings (₹)" value={p.savings} onChange={(v) => update("savings", v)} />
                <Num label="Investments (₹)" value={p.investments} onChange={(v) => update("investments", v)} />
                <Num label="Fixed Deposits (₹)" value={p.fixedDeposits} onChange={(v) => update("fixedDeposits", v)} />
              </Grid>
            </Section>
          )}
          {step === 4 && (
            <Section title="Loans" desc="Existing debts we should factor in.">
              <Grid>
                <Num label="Outstanding Loan Amount (₹)" value={p.existingLoans} onChange={(v) => update("existingLoans", v)} />
                <Num label="Monthly EMI (₹)" value={p.emi} onChange={(v) => update("emi", v)} />
              </Grid>
            </Section>
          )}
          {step === 5 && (
            <Section title="Financial goals" desc="Pick what you're chasing.">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_GOALS.map((g) => {
                  const active = !!p.goals.find((x) => x.name === g);
                  return (
                    <button key={g} type="button" onClick={() => toggleGoal(g)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
                      {g}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <Input placeholder="Add a custom goal" value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} />
                <Button type="button" variant="outline" onClick={addCustomGoal}><Plus className="h-4 w-4" /></Button>
              </div>
              {p.goals.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {p.goals.map((g) => (
                    <li key={g.id} className="glass rounded-lg p-3 flex items-center justify-between text-sm">
                      <span>{g.name} · {fmt(g.targetAmount)} in {g.targetMonths}m</span>
                      <button onClick={() => setP((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== g.id) }))}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}
          {step === 6 && (
            <Section title="Risk profile" desc="How adventurous should advice be?">
              <RadioGroup value={p.risk} onValueChange={(v) => update("risk", v as Profile["risk"])} className="space-y-2">
                {(["Conservative","Moderate","Aggressive"] as const).map((r) => (
                  <label key={r} className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${p.risk === r ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem value={r} className="mt-0.5" />
                    <div>
                      <div className="font-medium">{r}</div>
                      <div className="text-xs text-muted-foreground">
                        {r === "Conservative" && "Stability over growth. FDs, debt funds, low equity."}
                        {r === "Moderate" && "Balanced 60/40 equity-debt mix with diversified SIPs."}
                        {r === "Aggressive" && "High growth. Equity-heavy, comfortable with volatility."}
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </Section>
          )}
          {step === 7 && (
            <Section title="Your Financial Profile" desc="Generated from your inputs.">
              <Summary p={p} />
            </Section>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={finish}>Enter Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({ p }: { p: Profile }) {
  const h = healthScore(p);
  const em = emergencyMonths(p);
  const items = [
    { label: "Name", value: p.fullName || "—" },
    { label: "Income", value: fmt(p.salary + p.otherIncome) },
    { label: "Savings", value: fmt(p.savings) },
    { label: "Risk Profile", value: p.risk },
    { label: "Financial Health", value: `${h.score}/100 (${h.grade})` },
    { label: "Emergency Fund", value: `${em.toFixed(1)} Months` },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i.label} className="glass rounded-lg p-4">
            <div className="text-xs text-muted-foreground">{i.label}</div>
            <div className="mt-1 font-display text-lg font-semibold">{i.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 glass rounded-lg p-4">
        <div className="text-xs uppercase tracking-wide text-primary">AI Summary</div>
        <p className="mt-1 text-sm">{aiSummary(p)}</p>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label>{children}</div>;
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Field label={label}>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </Field>
  );
}
