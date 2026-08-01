import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Brain, Target, Wallet, Receipt, MessageSquareText, FileBarChart, Settings, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuth, getProfile, clearProfile } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

const NAV = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Financial Twin", url: "/financial-twin", icon: Brain },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Loan Advisor", url: "/loan-advisor", icon: Wallet },
  { title: "Expense Analyzer", url: "/expenses", icon: Receipt },
  { title: "AI Copilot", url: "/copilot", icon: MessageSquareText },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

function AppLayout() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const auth = getAuth();
    const profile = getProfile();
    if (!auth) { nav({ to: "/auth/signin" }); return; }
    if (!profile) { nav({ to: "/onboarding" }); return; }
  }, [nav]);

  const auth = getAuth();
  const profile = getProfile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link to="/dashboard" className="flex items-center gap-2 p-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shrink-0"><Sparkles className="h-4 w-4" /></div>
              <span className="font-display text-lg font-bold group-data-[collapsible=icon]:hidden">FinPilot</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigate</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((i) => (
                    <SidebarMenuItem key={i.url}>
                      <SidebarMenuButton asChild isActive={pathname === i.url} tooltip={i.title}>
                        <Link to={i.url}>
                          <i.icon className="h-4 w-4" />
                          <span>{i.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="glass rounded-lg p-2 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-primary text-sm font-semibold">
                {(auth?.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{auth?.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{profile?.risk} · {profile?.city || "—"}</div>
              </div>
              <button onClick={() => { clearProfile(); toast.success("Signed out"); nav({ to: "/" }); }} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-4 gap-3 backdrop-blur-xl bg-background/60 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="flex-1" />
            <Link to="/financial-twin">
              <Button size="sm" variant="outline" className="glass">
                <Brain className="mr-1 h-4 w-4" /> Open Financial Twin
              </Button>
            </Link>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
