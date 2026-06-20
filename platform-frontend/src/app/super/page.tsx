"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Store, Users, TrendingUp, Activity } from "lucide-react";

interface Analytics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  tenantsByPlan: { _id: string; count: number }[];
}

export default function SuperDashboardPage() {
  const { isAuthenticated, isSuperAdmin , isHydrated} = useAuth();
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Checking access...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-500 py-12">
        Failed to load analytics.
      </div>
    );
  }

  const stats = [
    {
      label: "Total Stores",
      value: analytics.totalTenants,
      icon: <Store className="h-6 w-6" />,
      color: "bg-blue-500",
    },
    {
      label: "Active Stores",
      value: analytics.activeTenants,
      icon: <Activity className="h-6 w-6" />,
      color: "bg-green-500",
    },
    {
      label: "Total Users",
      value: analytics.totalUsers,
      icon: <Users className="h-6 w-6" />,
      color: "bg-purple-500",
    },
    {
      label: "Inactive Stores",
      value: analytics.totalTenants - analytics.activeTenants,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Platform Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg text-white ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-6">Stores by Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {["free", "basic", "premium"].map((plan) => {
            const planData = analytics.tenantsByPlan.find(
              (p) => p._id === plan,
            );
            const count = planData?.count || 0;
            const colors: Record<string, string> = {
              free: "bg-gray-500",
              basic: "bg-blue-500",
              premium: "bg-purple-500",
            };
            return (
              <div key={plan} className="text-center p-6 bg-gray-50 rounded-lg">
                <div
                  className={`h-3 w-3 rounded-full mx-auto mb-3 ${colors[plan]}`}
                />
                <p className="text-4xl font-extrabold capitalize">{count}</p>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {plan} Plan
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/super/tenants?action=new"
            className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            + Create New Store
          </Link>
          <Link
            href="/super/tenants"
            className="px-4 py-2 rounded-lg border font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Manage All Stores
          </Link>
        </div>
      </div>
    </div>
  );
}
