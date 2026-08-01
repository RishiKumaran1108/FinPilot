import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Target, Wallet, MessageSquareText, Shield, ArrowRight, Sparkles, PlayCircle, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinPilot AI — Your Personal AI Financial Copilot" },
      { name: "description", content: "Not just tracking money. Guiding every financial decision with AI." },
    ],
  }),
  component: Landing,
});

function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/40 border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">FinPilot<span className="text-primary"> AI</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#twin" className="hover:text-foreground">Financial Twin</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth/signin"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/auth/signup"><Button>Get started</Button></Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Introducing the Financial Twin
        </div>
        <h1 className="mx-auto max-w-4xl font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
          Your Personal <span className="text-gradient">AI Financial</span> Copilot
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Analyze spending, plan goals, predict future finances and simulate life decisions using AI.
          Not just tracking money — guiding every financial decision.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link to="/auth/signup">
            <Button size="lg" className="h-12 px-6 text-base">
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-12 px-6 text-base glass">
            <PlayCircle className="mr-1 h-4 w-4" /> Watch Demo
          </Button>
        </div>

        <div className="mt-20 mx-auto max-w-5xl glass-strong rounded-3xl p-2">
          <div className="rounded-2xl bg-background/60 p-8 text-left">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Financial Health", value: "82/100", sub: "Grade A" },
                { label: "Monthly Savings", value: "₹14,200", sub: "+12% MoM" },
                { label: "Goals on Track", value: "4 / 5", sub: "Bike • Vacation" },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className="mt-2 font-display text-3xl font-bold">{s.value}</div>
                  <div className="text-xs text-primary">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 h-32 rounded-xl bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Wallet, title: "Expense Intelligence", desc: "AI categorizes statements and surfaces what's quietly draining you." },
  { icon: Brain, title: "Financial Twin", desc: "Simulate raises, job loss, loans or marriage before they happen." },
  { icon: Target, title: "Goal Planning", desc: "Bike, car, vacation, house — get realistic monthly plans and success odds." },
  { icon: Shield, title: "Loan Advisor", desc: "Know if you can really afford it before the EMI hits." },
  { icon: MessageSquareText, title: "AI Copilot", desc: "Chat in plain English. Get answers based on your actual finances." },
  { icon: TrendingUp, title: "Health Engine", desc: "A live score with grades, trends and personalized next steps." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold">Everything finance apps forgot</h2>
        <p className="mt-3 text-muted-foreground">Built around how you actually make decisions.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="glass group rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TwinTeaser() {
  return (
    <section id="twin" className="mx-auto max-w-7xl px-6 py-24">
      <div className="glass-strong rounded-3xl p-10 md:p-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative grid gap-12 md:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-medium">FLAGSHIP</div>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold leading-tight">
              Meet your <span className="text-gradient">Financial Twin</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              A parallel version of your finances that lets you test life decisions before living them.
              See exactly how a car loan, wedding or career switch reshapes your future.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Before vs. After scorecards","Interactive 5-year projections","Risk-adjusted recommendations"].map((t) => (
                <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">Current Score</div>
              <div className="mt-2 font-display text-5xl font-bold text-success">90</div>
              <div className="mt-1 text-xs text-muted-foreground">Savings ₹1,50,000</div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">After Car Loan</div>
              <div className="mt-2 font-display text-5xl font-bold text-warning">72</div>
              <div className="mt-1 text-xs text-muted-foreground">Savings ₹80,000</div>
            </div>
            <div className="col-span-2 glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">AI Verdict</div>
              <div className="mt-1 text-sm">Affordable, but delays your house goal by ~14 months. Consider a smaller down payment or 4-yr tenure.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Priya S.", role: "Product Designer", quote: "The Financial Twin made me cancel a car loan I would've regretted. Worth it." },
    { name: "Rohan M.", role: "Software Engineer", quote: "Finally a finance app that explains *why*. The AI Copilot feels like a real advisor." },
    { name: "Anika R.", role: "Founder", quote: "I run my whole household budget through FinPilot. It's that good." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="text-center font-display text-4xl font-bold">Loved by people who hate spreadsheets</h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {items.map((t) => (
          <div key={t.name} className="glass rounded-2xl p-6">
            <p className="text-sm">"{t.quote}"</p>
            <div className="mt-4 text-sm font-medium">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Starter", price: "Free", desc: "Track, budget, basic AI insights", features: ["Expense intelligence","Goal planner","Health score"] },
    { name: "Pro", price: "₹299", sub: "/mo", desc: "The full copilot experience", features: ["Everything in Starter","Financial Twin","Unlimited AI Copilot","Loan advisor"], featured: true },
    { name: "Family", price: "₹599", sub: "/mo", desc: "For households", features: ["Up to 5 members","Shared goals","Priority support"] },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-14 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold">Simple pricing</h2>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when the Twin earns its keep.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-2xl p-8 ${t.featured ? "glass-strong border-primary/40 ring-1 ring-primary/40 shadow-[var(--shadow-glow)]" : "glass"}`}>
            {t.featured && <div className="mb-3 inline-flex rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">Most popular</div>}
            <h3 className="font-display text-2xl font-bold">{t.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold">{t.price}</span>
              {t.sub && <span className="text-muted-foreground">{t.sub}</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {t.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>)}
            </ul>
            <Link to="/auth/signup" className="mt-8 block">
              <Button className="w-full" variant={t.featured ? "default" : "outline"}>Get {t.name}</Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
          <span>FinPilot AI © {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Features />
      <TwinTeaser />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
