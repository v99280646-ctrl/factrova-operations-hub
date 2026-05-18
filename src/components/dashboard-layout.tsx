import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Truck,
  FolderKanban,
  Boxes,
  Wallet,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Factory,
  Wrench,
  ShieldCheck,
  Plug,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/customers", label: "Customers", icon: Users },
  { to: "/dashboard/vendors", label: "Vendors", icon: Truck },
  { to: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { to: "/dashboard/services", label: "Services", icon: Wrench },
  { to: "/dashboard/staff", label: "Staff Access & Perfomance", icon: ShieldCheck },
  { to: "/dashboard/stock", label: "Stock Management", icon: Boxes },
  { to: "/dashboard/finance", label: "Accounts & Finance", icon: Wallet },
  { to: "/dashboard/integrations", label: "Integrations", icon: Plug },
] as const;

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
            <Factory className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-base font-bold tracking-tight text-sidebar-foreground">
                Factrova
              </p>
              <p className="truncate text-[11px] text-muted-foreground">Factory Operations</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {nav.map((item) => {
            const active =
              item.to === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 rotate-90 transition-transform", collapsed && "-rotate-90")} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search…" className="h-9 w-64 pl-9" />
            </div>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 hover:bg-accent">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[image:var(--gradient-primary)] text-xs font-semibold text-primary-foreground">
                    AK
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">Admin</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
