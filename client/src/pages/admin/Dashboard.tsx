import { Link } from "wouter";
import {
  Calendar, Flag, Users, TrendingUp, CheckCircle, Clock,
  Star, ArrowRight, UserCheck, Crown, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: recentActivity } = trpc.admin.activityLog.useQuery(undefined, { enabled: isAuthenticated });
  type ActivityItem = { id: number; action: string; entityType: string | null; entityId: number | null; performedBy: string | null; details: string | null; createdAt: Date };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-patriot-200 border-t-patriot-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-patriot-100 flex items-center justify-center mx-auto mb-5">
            <Star className="w-8 h-8 text-patriot-600" />
          </div>
          <h1 className="text-2xl font-serif text-navy-900 mb-2">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to access the NC 4th of July Festival back-office portal.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full bg-patriot-600 hover:bg-patriot-700 text-white btn-press">
              Sign In to Continue
            </Button>
          </a>
          <div className="mt-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                ← Back to Public Site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Event Signups",
      value: stats?.totalSignups ?? "—",
      icon: UserCheck,
      color: "text-patriot-600",
      bg: "bg-patriot-50",
      href: "/admin/signups",
    },
    {
      label: "Parade Registrations",
      value: stats?.totalParade ?? "—",
      icon: Flag,
      color: "text-navy-600",
      bg: "bg-navy-50",
      href: "/admin/parade",
    },
    {
      label: "Volunteers",
      value: stats?.totalMembers ?? "—",
      icon: Users,
      color: "text-gold-600",
      bg: "bg-gold-50",
      href: "/admin/volunteers",
    },
    {
      label: "Active Events",
      value: stats?.totalEvents ?? "—",
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/admin/events",
    },
  ];

  const quickLinks = [
    { href: "/admin/events", icon: Calendar, label: "Manage Events", desc: "Add, edit, or remove festival events" },
    { href: "/admin/parade", icon: Flag, label: "Parade Entries", desc: "Review and approve parade registrations" },
    { href: "/admin/heritage", icon: BookOpen, label: "Heritage Content", desc: "Update timeline, presidents, and history" },
    { href: "/admin/queens", icon: Crown, label: "Festival Queens", desc: "Manage the queens gallery" },
    { href: "/admin/committees", icon: Users, label: "Committee Members", desc: "Update the committee directory" },
    { href: "/admin/signups", icon: UserCheck, label: "Event Signups", desc: "View all event registrations" },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle={`Welcome back, ${user?.name ?? "Admin"}`}>
      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <div className="bg-white rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.bg)}>
                    <Icon className={cn("w-5 h-5", card.color)} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </div>
                <div className="font-display text-3xl text-navy-900 mb-1">{card.value}</div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-serif font-semibold text-navy-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="bg-white rounded-xl border border-border shadow-sm p-4 hover:shadow-md hover:border-patriot-200 transition-all cursor-pointer group flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center shrink-0 group-hover:bg-patriot-50 transition-colors">
                      <Icon className="w-4 h-4 text-navy-600 group-hover:text-patriot-600 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-navy-900 text-sm">{link.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{link.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-base font-serif font-semibold text-navy-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                {recentActivity && recentActivity.length > 0 ? (
              <div className="divide-y divide-border">
                {recentActivity.map((item: ActivityItem, i: number) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      item.entityType === "parade" ? "bg-navy-100" :
                      item.entityType === "signup" ? "bg-patriot-100" : "bg-gold-100"
                    )}>
                      {item.entityType === "parade" ? <Flag className="w-3.5 h-3.5 text-navy-600" /> :
                       item.entityType === "signup" ? <UserCheck className="w-3.5 h-3.5 text-patriot-600" /> :
                       <Users className="w-3.5 h-3.5 text-gold-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-navy-900 truncate">{item.action}{item.details ? `: ${item.details}` : ""}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No recent activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Festival Info Banner */}
      <div className="mt-6 bg-gradient-to-r from-navy-900 to-patriot-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-serif text-lg mb-1">231st NC 4th of July Festival</p>
          <p className="text-navy-300 text-sm">July 4th, 2026 · Southport, NC · P.O. Box 11247, Southport NC 28461</p>
        </div>
        <Link href="/events">
          <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 shrink-0">
            View Public Site <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </AdminLayout>
  );
}
