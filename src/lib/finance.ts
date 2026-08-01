import type { Profile } from "./store";

export const fmt = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export function totalIncome(p: Profile) {
  return p.salary + p.otherIncome;
}

export function totalExpenses(p: Profile) {
  return p.rent + p.food + p.shopping + p.transport + p.entertainment + p.bills + p.emi;
}

export function monthlySavings(p: Profile) {
  return totalIncome(p) - totalExpenses(p);
}

export function savingsRate(p: Profile) {
  const i = totalIncome(p);
  return i > 0 ? monthlySavings(p) / i : 0;
}

export function debtRatio(p: Profile) {
  const i = totalIncome(p);
  return i > 0 ? p.emi / i : 0;
}

export function emergencyMonths(p: Profile) {
  const e = totalExpenses(p);
  return e > 0 ? p.savings / e : 0;
}

export function emergencyTarget(p: Profile) {
  return totalExpenses(p) * 6;
}

export function healthScore(p: Profile): { score: number; grade: string; summary: string } {
  const sr = savingsRate(p);
  const dr = debtRatio(p);
  const em = emergencyMonths(p);
  const exp = totalExpenses(p);
  const i = totalIncome(p);

  let score = 0;
  // Savings rate up to 35
  score += Math.max(0, Math.min(35, sr * 100));
  // Emergency up to 25
  score += Math.max(0, Math.min(25, (em / 6) * 25));
  // Debt ratio up to 20 (lower better)
  score += Math.max(0, 20 - Math.min(20, dr * 50));
  // Expense stability up to 20 — favors expenses < 70% income
  if (i > 0) {
    const ratio = exp / i;
    score += Math.max(0, 20 - Math.max(0, ratio - 0.5) * 40);
  }

  score = Math.round(Math.max(5, Math.min(100, score)));

  const grade =
    score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "E";

  const summary =
    score >= 80
      ? "Excellent financial health. You're saving well and have a strong cushion."
      : score >= 65
      ? "Healthy profile. A few tweaks could push you into elite territory."
      : score >= 50
      ? "Stable but vulnerable. Focus on building emergency reserves."
      : "High risk zone. Cut discretionary expenses and prioritize an emergency fund.";

  return { score, grade, summary };
}

export function recommendations(p: Profile): string[] {
  const recs: string[] = [];
  const sr = savingsRate(p);
  const em = emergencyMonths(p);
  const i = totalIncome(p);

  if (sr < 0.2) recs.push(`Your savings rate is ${(sr * 100).toFixed(0)}%. Target 20%+ for long-term wealth.`);
  if (em < 6) recs.push(`Emergency fund covers ${em.toFixed(1)} months. Build toward 6 months (${fmt(emergencyTarget(p))}).`);
  if (i > 0 && p.shopping / i > 0.12) recs.push(`Shopping is ${((p.shopping / i) * 100).toFixed(0)}% of income — trim by 25% to save ${fmt(p.shopping * 0.25)}/mo.`);
  if (p.emi / i > 0.4) recs.push(`EMI burden is ${((p.emi / i) * 100).toFixed(0)}% of income — refinance or accelerate payoff.`);
  if (p.investments < p.salary * 6) recs.push(`Investments are under 6x salary — consider SIPs to compound long-term.`);
  if (recs.length === 0) recs.push("You're firing on all cylinders. Consider increasing equity allocation.");
  return recs.slice(0, 4);
}

export function aiSummary(p: Profile): string {
  const sr = savingsRate(p) * 100;
  const em = emergencyMonths(p);
  const i = totalIncome(p);
  const shop = i > 0 ? (p.shopping / i) * 100 : 0;
  const parts: string[] = [];
  if (sr > 25) parts.push("You maintain strong savings discipline");
  else if (sr > 10) parts.push("Your savings habits are decent but could improve");
  else parts.push("Your savings rate is below recommended levels");
  if (shop > 12) parts.push(`shopping expenses are higher than average (${shop.toFixed(0)}% of income)`);
  if (em < 3) parts.push("and your emergency cushion is thin");
  else if (em > 6) parts.push("and your emergency fund is robust");
  return parts.join(", ") + ".";
}

// Forecast next 12 months of savings (cumulative)
export function savingsForecast(p: Profile, months = 12) {
  const monthly = monthlySavings(p);
  const out: { month: string; savings: number }[] = [];
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  let total = p.savings;
  for (let i = 0; i < months; i++) {
    total += monthly;
    out.push({ month: labels[(now.getMonth() + i) % 12], savings: Math.max(0, total) });
  }
  return out;
}

export function expenseBreakdown(p: Profile) {
  return [
    { name: "Rent", value: p.rent, color: "var(--color-chart-1)" },
    { name: "Food", value: p.food, color: "var(--color-chart-2)" },
    { name: "Shopping", value: p.shopping, color: "var(--color-chart-3)" },
    { name: "Transport", value: p.transport, color: "var(--color-chart-4)" },
    { name: "Entertainment", value: p.entertainment, color: "var(--color-chart-5)" },
    { name: "Bills", value: p.bills, color: "oklch(0.55 0.18 200)" },
    { name: "EMI", value: p.emi, color: "oklch(0.6 0.2 30)" },
  ].filter((x) => x.value > 0);
}

// Goal calculation
export function planGoal(p: Profile, target: number, months: number) {
  const monthly = months > 0 ? target / months : 0;
  const capacity = Math.max(1, monthlySavings(p));
  const probability = Math.min(100, Math.round((capacity / Math.max(1, monthly)) * 80));
  return { monthly, probability };
}

// Loan affordability
export function loanAdvice(p: Profile, loanAmount: number, tenureMonths: number, rate = 0.105) {
  const r = rate / 12;
  const emi = (loanAmount * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  const totalEmi = p.emi + emi;
  const burden = totalEmi / Math.max(1, totalIncome(p));
  const risk = burden > 0.5 ? "High" : burden > 0.35 ? "Moderate" : "Low";
  const approvalProb = Math.max(5, Math.min(95, Math.round(100 - burden * 140)));
  return { emi, burden, risk, approvalProb };
}

// Financial Twin scenarios
export type Scenario =
  | "salary_increase"
  | "job_loss"
  | "car_loan"
  | "home_loan"
  | "marriage"
  | "higher_education"
  | "startup";

export function simulate(p: Profile, scenario: Scenario, intensity = 1) {
  const next: Profile = JSON.parse(JSON.stringify(p));
  let note = "";
  switch (scenario) {
    case "salary_increase":
      next.salary = Math.round(p.salary * (1 + 0.3 * intensity));
      note = `Salary raised by ${Math.round(30 * intensity)}%.`;
      break;
    case "job_loss":
      next.salary = 0;
      next.savings = Math.max(0, p.savings - totalExpenses(p) * 3 * intensity);
      note = `No salary for ${Math.round(3 * intensity)} months.`;
      break;
    case "car_loan": {
      const car = 800000 * intensity;
      const { emi } = loanAdvice(p, car, 60);
      next.emi = p.emi + Math.round(emi);
      next.savings = Math.max(0, p.savings - car * 0.2);
      note = `New car loan EMI ≈ ${fmt(emi)}/mo.`;
      break;
    }
    case "home_loan": {
      const home = 4000000 * intensity;
      const { emi } = loanAdvice(p, home, 240, 0.085);
      next.emi = p.emi + Math.round(emi);
      next.savings = Math.max(0, p.savings - home * 0.2);
      note = `Home loan EMI ≈ ${fmt(emi)}/mo for 20 yrs.`;
      break;
    }
    case "marriage":
      next.savings = Math.max(0, p.savings - 1000000 * intensity);
      note = `One-time wedding expense ${fmt(1000000 * intensity)}.`;
      break;
    case "higher_education":
      next.savings = Math.max(0, p.savings - 1500000 * intensity);
      next.salary = Math.round(p.salary * (1 + 0.5 * intensity));
      note = `Education cost now; salary grows post-degree.`;
      break;
    case "startup":
      next.salary = Math.round(p.salary * 0.3);
      next.savings = Math.max(0, p.savings - 500000 * intensity);
      note = `Reduced income + ${fmt(500000 * intensity)} seed capital.`;
      break;
  }
  return { profile: next, note };
}
