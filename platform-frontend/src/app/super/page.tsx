"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Store,
  Users,
  Activity,
  ArrowRight,
  TrendingUp,
  Globe,
  Zap,
} from "lucide-react";

interface Analytics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  tenantsByPlan: { _id: string; count: number }[];
}

export default function SuperDashboardPage() {
  const { isAuthenticated, isSuperAdmin, isHydrated } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isSuperAdmin) {
      router.push("/");
      return;
    }

    const loadAnalytics = async () => {
      try {
        const data = (await api.get("/super/analytics")) as Analytics;
        setAnalytics(data);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [isAuthenticated, isSuperAdmin, router, isHydrated]);

  if (!isAuthenticated || !isSuperAdmin) {
    return null; // Handled by layout
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 bg-white/5 rounded-3xl border border-white/10"
          ></div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-12 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400">
        Failed to load platform analytics.
      </div>
    );
  }

  const inactiveTenants = analytics.totalTenants - analytics.activeTenants;
  const healthPercentage =
    analytics.totalTenants > 0
      ? Math.round((analytics.activeTenants / analytics.totalTenants) * 100)
      : 0;

  const stats = [
    {
      title: "Total Network",
      value: analytics.totalTenants,
      subtitle: "Registered Stores",
      icon: <Globe className="h-6 w-6" />,
      color: "from-blue-600 to-cyan-400",
      bgLight: "bg-blue-500/10",
      textColor: "text-cyan-400",
    },
    {
      title: "Active Stores",
      value: analytics.activeTenants,
      subtitle: `${healthPercentage}% Platform Health`,
      icon: <Activity className="h-6 w-6" />,
      color: "from-emerald-500 to-green-400",
      bgLight: "bg-emerald-500/10",
      textColor: "text-green-400",
    },
    {
      title: "Global Users",
      value: analytics.totalUsers,
      subtitle: "Across all tenants",
      icon: <Users className="h-6 w-6" />,
      color: "from-purple-600 to-pink-500",
      bgLight: "bg-purple-500/10",
      textColor: "text-pink-400",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Overview
          </h1>
          <p className="text-slate-400">
            Monitor the health and growth of your SaaS platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/super/tenants?action=new"
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/25"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Zap className="h-4 w-4 relative z-10" />
            <span className="relative z-10">Deploy New Store</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl overflow-hidden transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
          >
            {/* Glow effect behind icon */}
            <div
              className={`absolute top-6 right-6 w-12 h-12 rounded-full blur-xl bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-40 transition-opacity`}
            ></div>

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div
                className={`p-3 rounded-2xl ${stat.bgLight} border border-white/5 ${stat.textColor}`}
              >
                {stat.icon}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-slate-400 font-medium mb-1">{stat.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tight">
                  {stat.value}
                </span>
              </div>
              <p className={`text-sm mt-2 font-medium ${stat.textColor}`}>
                {stat.subtitle}
              </p>
            </div>

            {/* Decorative gradient bar */}
            <div
              className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`}
            ></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions / Shortcuts */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Store className="h-5 w-5 text-purple-400" /> Platform Management
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/super/tenants"
              className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Store className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="font-semibold text-white">All Tenants</h3>
                <p className="text-sm text-slate-400 mt-1">
                  View and manage all {analytics.totalTenants} registered stores
                </p>
              </div>
            </Link>

            <Link
              href="/super/tenants"
              className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Inactive Stores</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Review {inactiveTenants} suspended or inactive accounts
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-b from-purple-900/40 to-slate-900/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none"></div>

          <h2 className="text-xl font-bold text-white mb-6">System Status</h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">API Health</span>
                <span className="text-green-400 font-medium">100%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Database Uptime</span>
                <span className="text-green-400 font-medium">99.9%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[99.9%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Tenant Capacity</span>
                <span className="text-blue-400 font-medium">
                  {Math.min(
                    100,
                    Math.round((analytics.totalTenants / 100) * 100),
                  )}
                  %
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{
                    width: `${Math.min(100, Math.max(5, (analytics.totalTenants / 100) * 100))}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">
                {analytics.totalTenants} / 100 Soft Limit
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
