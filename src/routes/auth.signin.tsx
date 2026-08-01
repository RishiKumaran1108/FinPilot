import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { setAuth, hasOnboarded } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signin")({
  head: () => ({ meta: [{ title: "Sign in — FinPilot AI" }] }),
  component: SignIn,
});

function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email) || pw.length < 6) {
      setErr("Enter a valid email and password (min 6 chars).");
      return;
    }
    setAuth(email, email.split("@")[0]);
    toast.success("Welcome back");
    nav({ to: hasOnboarded() ? "/dashboard" : "/onboarding" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
          <span className="font-display text-2xl font-bold">FinPilot AI</span>
        </Link>
        <div className="glass-strong rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your copilot.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox /> Remember me
              </label>
              <a href="#" className="text-primary hover:underline">Forgot?</a>
            </div>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <Button type="submit" className="w-full h-11">Sign in</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/auth/signup" className="text-primary hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
