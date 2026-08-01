// Frontend-only profile store backed by localStorage.
// Demo data layer for FinPilot AI.

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  targetMonths: number;
};

export type Profile = {
  // Auth (mock)
  fullName: string;
  email: string;
  // Personal
  age: number;
  occupation: string;
  city: string;
  // Income
  salary: number;
  otherIncome: number;
  // Expenses
  rent: number;
  food: number;
  shopping: number;
  transport: number;
  entertainment: number;
  bills: number;
  // Savings
  savings: number;
  investments: number;
  fixedDeposits: number;
  // Loans
  existingLoans: number;
  emi: number;
  // Goals
  goals: Goal[];
  // Risk
  risk: "Conservative" | "Moderate" | "Aggressive";
  createdAt: string;
};

const KEY = "finpilot.profile.v1";
const AUTH_KEY = "finpilot.auth.v1";

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Profile; } catch { return null; }
}

export function clearProfile() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(AUTH_KEY);
}

export function setAuth(email: string, name: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, name }));
}

export function getAuth(): { email: string; name: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function hasOnboarded(): boolean {
  return !!getProfile();
}
