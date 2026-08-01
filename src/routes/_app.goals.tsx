import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getProfile, saveProfile, type Goal } from "@/lib/store";
import { fmt, planGoal } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/goals")({
  ssr: false,
  head: () => ({ meta: [{ title: "Goals — FinPilot AI" }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const initial = getProfile();
  const [profile, setProfile] = useState(initial);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(100000);
  const [months, setMonths] = useState(12);

  if (!profile) return null;

  function persist(goals: Goal[]) {
    const next = { ...profile!, goals };
    saveProfile(next);
    setProfile(next);
  }

  function add() {
    if (!name.trim()) return;
    persist([...profile!.goals, { id: crypto.randomUUID(), name, targetAmount: amount, targetMonths: months }]);
    setName(""); setAmount(100000); setMonths(12);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Goal Planner</h1>
        <p className="text-sm text-muted-foreground">Calculate required monthly savings and success probability.</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Add a goal</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2 space-y-1.5"><Label>Goal name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Buy a Royal Enfield" /></div>
          <div className="space-y-1.5"><Label>Target (₹)</Label><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} /></div>
          <div className="space-y-1.5"><Label>Months</Label><Input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value) || 1)} /></div>
        </div>
        <Button className="mt-4" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add goal</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {profile.goals.map((g) => {
          const plan = planGoal(profile, g.targetAmount, g.targetMonths);
          const completion = new Date();
          completion.setMonth(completion.getMonth() + g.targetMonths);
          return (
            <div key={g.id} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> {g.name}</h4>
                <button onClick={() => persist(profile.goals.filter((x) => x.id !== g.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Field label="Target">{fmt(g.targetAmount)}</Field>
                <Field label="Timeline">{g.targetMonths} months</Field>
                <Field label="Required / month">{fmt(plan.monthly)}</Field>
                <Field label="Success probability">{plan.probability}%</Field>
              </div>
              <div className="mt-4">
                <Progress value={plan.probability} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">Expected completion · {completion.toLocaleString("en-IN", { month: "short", year: "numeric" })}</div>
              </div>
            </div>
          );
        })}
        {profile.goals.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground md:col-span-2">No goals yet. Add one above to see calculations.</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display font-semibold">{children}</div>
    </div>
  );
}
