import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getAuth, getProfile, saveProfile, clearProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings as SettingsIcon, RotateCw, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Settings — FinPilot AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const nav = useNavigate();
  const auth = getAuth();
  const [p, setP] = useState(getProfile());

  if (!p) return null;

  function save() {
    saveProfile(p!);
    toast.success("Profile updated");
  }

  function reset() {
    clearProfile();
    toast.success("Profile cleared");
    nav({ to: "/" });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><SettingsIcon className="h-7 w-7 text-primary" /> Settings</h1>
        <p className="text-sm text-muted-foreground">Tweak your profile any time.</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold">Account</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name"><Input value={p.fullName} onChange={(e) => setP({ ...p, fullName: e.target.value })} /></Field>
          <Field label="Email"><Input value={auth?.email ?? p.email} disabled /></Field>
          <Field label="City"><Input value={p.city} onChange={(e) => setP({ ...p, city: e.target.value })} /></Field>
          <Field label="Occupation"><Input value={p.occupation} onChange={(e) => setP({ ...p, occupation: e.target.value })} /></Field>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold">Finances</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Monthly Salary (₹)"><Input type="number" value={p.salary} onChange={(e) => setP({ ...p, salary: Number(e.target.value) || 0 })} /></Field>
          <Field label="Current Savings (₹)"><Input type="number" value={p.savings} onChange={(e) => setP({ ...p, savings: Number(e.target.value) || 0 })} /></Field>
          <Field label="Monthly EMI (₹)"><Input type="number" value={p.emi} onChange={(e) => setP({ ...p, emi: Number(e.target.value) || 0 })} /></Field>
          <Field label="Investments (₹)"><Input type="number" value={p.investments} onChange={(e) => setP({ ...p, investments: Number(e.target.value) || 0 })} /></Field>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold">Risk profile</h3>
        <RadioGroup value={p.risk} onValueChange={(v) => setP({ ...p, risk: v as typeof p.risk })} className="grid grid-cols-3 gap-3">
          {(["Conservative","Moderate","Aggressive"] as const).map((r) => (
            <label key={r} className={`rounded-xl border p-3 text-center cursor-pointer ${p.risk === r ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value={r} className="sr-only" />
              <div className="text-sm font-medium">{r}</div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save}>Save changes</Button>
        <Button variant="outline" onClick={() => nav({ to: "/onboarding" })} className="glass"><RotateCw className="mr-1 h-4 w-4" /> Redo onboarding</Button>
        <Button variant="outline" onClick={reset} className="glass text-destructive border-destructive/40"><LogOut className="mr-1 h-4 w-4" /> Clear data & sign out</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
