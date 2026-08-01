import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { getProfile } from "@/lib/store";
import { fmt, totalIncome, totalExpenses, monthlySavings, healthScore, loanAdvice, emergencyMonths } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, User } from "lucide-react";

export const Route = createFileRoute("/_app/copilot")({
  ssr: false,
  head: () => ({ meta: [{ title: "AI Copilot — FinPilot AI" }] }),
  component: Copilot,
});

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Can I afford a bike?",
  "What if I lose my job?",
  "Should I take a personal loan of 3 lakhs?",
  "How much should I save monthly?",
];

function Copilot() {
  const p = getProfile();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: `Hi ${p?.fullName.split(" ")[0] || "there"} — I'm your AI Copilot. I know your income, expenses, savings and goals. Ask me anything.` },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  if (!p) return null;

  function reply(q: string): string {
    const lower = q.toLowerCase();
    const income = totalIncome(p!);
    const exp = totalExpenses(p!);
    const save = monthlySavings(p!);
    const h = healthScore(p!);
    const em = emergencyMonths(p!);

    if (lower.includes("afford") && lower.includes("bike")) {
      const price = 150000;
      const months = price / Math.max(1, save);
      return `A bike around ${fmt(price)} would take ~${months.toFixed(1)} months of your current savings rate (${fmt(save)}/mo). ${months < 12 ? "Affordable within a year — proceed if you want it." : "It'd stretch you. Consider a used bike or smaller model."}`;
    }
    if (lower.includes("lose") && lower.includes("job")) {
      return `If your income stopped today, your savings of ${fmt(p!.savings)} would cover ${em.toFixed(1)} months at current expenses (${fmt(exp)}/mo). ${em < 6 ? "Build emergency fund toward 6 months." : "You're in a strong position to weather job loss."}`;
    }
    if (lower.includes("loan")) {
      const amt = parseInt(lower.replace(/[^\d]/g, "")) * (lower.includes("lakh") ? 100000 : 1) || 300000;
      const a = loanAdvice(p!, amt, 36);
      return `A ${fmt(amt)} loan over 3 years ≈ EMI of ${fmt(a.emi)}. Total EMI burden becomes ${(a.burden * 100).toFixed(0)}% of income — ${a.risk} risk. Approval probability ~${a.approvalProb}%.`;
    }
    if (lower.includes("save") || lower.includes("saving")) {
      return `You're currently saving ${fmt(save)}/mo (${((save / Math.max(1, income)) * 100).toFixed(0)}% rate). For your goals, aim for 20-30% of income — that's ${fmt(income * 0.25)}/mo. Your health score is ${h.score}/100 (${h.grade}).`;
    }
    return `Based on your profile: income ${fmt(income)}, expenses ${fmt(exp)}, savings rate ${((save / Math.max(1, income)) * 100).toFixed(0)}%, health ${h.score}/100. Try asking about a specific decision — a loan, a purchase, or a goal.`;
  }

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q) return;
    const next: Msg[] = [...msgs, { role: "user" as const, text: q }];
    setMsgs(next);
    setInput("");
    setTimeout(() => setMsgs([...next, { role: "assistant" as const, text: reply(q) }]), 400);
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Sparkles className="h-7 w-7 text-primary" /> AI Copilot</h1>
        <p className="text-sm text-muted-foreground">Chat about your finances. Answers use your real onboarding data.</p>
      </div>

      <div className="glass-strong rounded-2xl flex-1 p-6 overflow-y-auto space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`grid h-8 w-8 place-items-center rounded-full shrink-0 ${m.role === "user" ? "bg-secondary" : "bg-primary text-primary-foreground"}`}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-secondary" : "glass"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)} className="glass rounded-full text-xs px-3 py-1.5 hover:border-primary/50 border border-border">{s}</button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything about your finances..." className="h-12" />
        <Button type="submit" size="lg" className="h-12"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
