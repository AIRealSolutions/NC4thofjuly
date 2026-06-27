import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Calendar, Flag, Users, Crown, BookOpen, Star,
  LogOut, Menu, X, ChevronRight, Shield, Settings, FileText,
  UserCheck, Megaphone, Radio, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation as useWouterLocation } from "wouter";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/signups", label: "Event Signups", icon: UserCheck },
  { href: "/admin/parade", label: "Parade Entries", icon: Flag },
  { href: "/admin/parade-day", label: "🎺 Parade Day Control", icon: Radio },
  { href: "/admin/volunteers", label: "Volunteers", icon: Users },
  { href: "/admin/committees", label: "Committees", icon: Shield },
  { href: "/admin/heritage", label: "Heritage", icon: BookOpen },
  { href: "/admin/queens", label: "Festival Queens", icon: Crown },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

const LIVE_LINKS = [
  { href: "/parade/live", label: "Live Board", icon: Radio },
  { href: "/parade/marshal", label: "Start Line Marshal", icon: Flag },
  { href: "/parade/tracker", label: "Unit Tracker", icon: ExternalLink },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
    onError: () => toast.error("Logout failed"),
  });

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-navy-950 text-white flex flex-col transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-navy-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-patriot-600 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-serif text-sm font-semibold leading-tight">NC 4th of July</p>
              <p className="text-xs text-navy-400">Admin Portal</p>
            </div>
          </Link>
        </div>

        {/* User */}
        {user && (
          <div className="px-5 py-3 border-b border-navy-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-patriot-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name ?? "Admin"}</p>
              <p className="text-xs text-navy-400 truncate">{user.role === "admin" ? "Administrator" : "Committee Member"}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer",
                      active
                        ? "bg-patriot-600 text-white"
                        : "text-navy-300 hover:bg-navy-800 hover:text-white"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-navy-800">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-navy-500">Live Parade Links</p>
            <div className="space-y-0.5">
              {LIVE_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-navy-400 hover:bg-navy-800 hover:text-white transition-colors cursor-pointer">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-navy-800 space-y-0.5">
            <Link href="/">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy-300 hover:bg-navy-800 hover:text-white transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Back to Public Site</span>
              </div>
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-navy-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-navy-300 hover:text-white hover:bg-navy-800"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border shadow-sm px-4 md:px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex-1 min-w-0">
            {title && <h1 className="font-serif text-lg text-navy-900 truncate">{title}</h1>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs border-navy-200 text-navy-700 hidden sm:flex gap-1.5">
                <ChevronRight className="w-3 h-3 rotate-180" />
                Public Site
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
