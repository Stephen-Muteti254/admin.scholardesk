import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  Bot,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MonitorSmartphone,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  UserSquare2,
  FileText,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const groups: { label: string; items: { to: string; label: string; icon: typeof BarChart3 }[] }[] = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/materials", label: "Exam Materials", icon: BookOpen },
      { to: "/orders", label: "Orders", icon: Receipt },
      { to: "/payments", label: "Payments & Payouts", icon: CreditCard },
    ],
  },
  {
    label: "Service desk",
    items: [
      { to: "/ai-requests", label: "AI & Plagiarism", icon: Bot },
      { to: "/class-help", label: "Class Help", icon: GraduationCap },
      { to: "/assignment-help", label: "Assignment Help", icon: FileText },
      { to: "/exam-help", label: "Exam & Interview", icon: LifeBuoy },
    ],
  },
  {
    label: "ExamStealth",
    items: [{ to: "/stealth", label: "Licences & Devices", icon: MonitorSmartphone }],
  },
  {
    label: "People",
    items: [
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/experts", label: "Experts", icon: UserSquare2 },
      { to: "/settings", label: "Settings & Team", icon: Settings },
    ],
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = (
    <nav className="flex flex-col gap-6 px-3 py-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent/15 text-accent"
                      : "text-ink-muted hover:bg-white/5 hover:text-ink-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto bg-ink-gradient text-ink-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 px-6 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-semibold">
            Scholar<span className="text-accent">Desk</span>
          </span>
        </Link>
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-ink-gradient text-ink-foreground">
            <div className="px-6 py-5 font-display text-base font-semibold">ScholarEdge Admin</div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Search refs, customers, materials…"
            className="hidden max-w-sm md:block"
          />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                6
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                    AO
                  </span>
                  <span className="hidden sm:inline">Amara Okafor</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Superadmin · Operations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings & team</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/">View public site</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 space-y-6 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
