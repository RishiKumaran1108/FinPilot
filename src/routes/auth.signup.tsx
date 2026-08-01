import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Github } from "lucide-react";
import { setAuth } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Sign up — FinPilot AI" }] }),
  component: SignUp,
});

function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    if (form.pw.length < 6) errs.pw = "Min 6 characters";
    if (form.pw !== form.pw2) errs.pw2 = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setAuth(form.email, form.name);
    toast.success("Account created. Let's set up your financial profile.");
    nav({ to: "/onboarding" });
  }

  function social(provider: string) {
    setAuth(`demo@${provider}.com`, "Demo User");
    toast.success(`Signed in with ${provider}`);
    nav({ to: "/onboarding" });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex relative overflow-hidden items-center justify-center p-12 bg-gradient-to-br from-primary/20 via-accent/10 to-background">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
            <span className="font-display text-2xl font-bold">FinPilot AI</span>
          </Link>
          <h2 className="font-display text-4xl font-bold leading-tight">Start guiding your money, not just tracking it.</h2>
          <p className="mt-4 text-muted-foreground">Join thousands using their Financial Twin to make smarter decisions.</p>
          <div className="mt-10 glass rounded-2xl p-5">
            <div className="text-xs text-muted-foreground">AI Verdict</div>
            <p className="mt-1 text-sm">"Based on your spending, you can afford that bike — but it'll delay your vacation by 3 months."</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Free forever. No card required.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => social("google")} className="glass">
              <GoogleIcon /> Google
            </Button>
            <Button variant="outline" onClick={() => social("github")} className="glass">
              <Github className="mr-1 h-4 w-4" /> GitHub
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Full Name" err={errors.name}>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Shona Mehta" />
            </Field>
            <Field label="Email" err={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
            </Field>
            <Field label="Password" err={errors.pw}>
              <Input type="password" value={form.pw} onChange={(e) => setForm({ ...form, pw: e.target.value })} />
            </Field>
            <Field label="Confirm Password" err={errors.pw2}>
              <Input type="password" value={form.pw2} onChange={(e) => setForm({ ...form, pw2: e.target.value })} />
            </Field>
            <Button type="submit" className="w-full h-11">Create account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/auth/signin" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, err, children }: { label: string; err?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-1 h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.2-1.5 3.4-4.5 3.4-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.6 3.2 1.2L17 6.7C15.7 5.5 14 4.8 12 4.8c-4 0-7.2 3.2-7.2 7.2s3.2 7.2 7.2 7.2c4.2 0 6.9-3 6.9-7.1 0-.5-.1-.9-.1-1.1H12z"/></svg>
  );
}
