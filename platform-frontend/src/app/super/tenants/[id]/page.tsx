"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Power,
  PowerOff,
  Palette,
  Settings,
  Info,
  CreditCard,
} from "lucide-react";

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  plan: string;
  createdAt: string;
  owner: { name: string; email: string };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string;
    heroImageUrl: string;
    heroTitle: string;
    heroSubtitle: string;
    fontFamily: string;
  };
  settings: {
    currency: string;
    language: string;
    whatsappNumber: string;
    email: string;
    phone: string;
    address: string;
    paymentMethods: { type: string; enabled: boolean }[];
    shippingMethods: { type: string; enabled: boolean }[];
    features: {
      loyaltyPoints: boolean;
      coupons: boolean;
      reviews: boolean;
      emailMarketing: boolean;
    };
  };
}

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.id as string;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        const data = (await api.get(`/super/tenants/${tenantId}`)) as Tenant;
        setTenant(data);
      } catch (err) {
        console.error("Error loading tenant:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTenant();
  }, [tenantId]);

  const toggleStatus = async () => {
    if (!tenant) return;
    try {
      await api.put(`/super/tenants/${tenant._id}/toggle-status`, {});
      const data = (await api.get(`/super/tenants/${tenantId}`)) as Tenant;
      setTenant(data);
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-12 text-slate-400">
        Store not found or an error occurred.
      </div>
    );
  }

  const planColors: Record<string, string> = {
    free: "bg-slate-800 text-slate-300 border-slate-700",
    basic: "bg-blue-900/40 text-blue-300 border-blue-700/50",
    premium: "bg-purple-900/40 text-purple-300 border-purple-700/50",
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/super/tenants"
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-lg"
            title="Back to Stores"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {tenant.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <p className="text-slate-400 text-sm">
                {tenant.slug}.yourplatform.com
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${planColors[tenant.plan]}`}
          >
            {tenant.plan} PLAN
          </span>
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              tenant.isActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                tenant.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            ></span>
            {tenant.isActive ? "Active" : "Suspended"}
          </span>
          <button
            onClick={toggleStatus}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              tenant.isActive
                ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
          >
            {tenant.isActive ? (
              <>
                <PowerOff className="h-4 w-4" /> Suspend
              </>
            ) : (
              <>
                <Power className="h-4 w-4" /> Activate
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>

          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Info className="h-4 w-4" />
            </div>
            Store Identity
          </h2>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                Subdomain
              </span>
              <span className="font-mono text-white text-sm bg-white/5 px-2 py-1 rounded">
                {tenant.slug}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                Creation Date
              </span>
              <span className="text-white text-sm">
                {new Date(tenant.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                Owner Name
              </span>
              <span className="text-white text-sm">{tenant.owner?.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                Owner Email
              </span>
              <span className="text-white text-sm">{tenant.owner?.email}</span>
            </div>
          </div>

          <a
            href={`http://${tenant.slug}.localhost:3000`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <ExternalLink className="h-4 w-4" /> Open Storefront
          </a>
        </div>

        {/* Theme */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>

          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Palette className="h-4 w-4" />
            </div>
            Brand & Theme
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-slate-300 text-sm font-medium">
                Primary Color
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {tenant.theme.primaryColor || "#000000"}
                </span>
                <div
                  className="h-6 w-6 rounded shadow-inner border border-white/10"
                  style={{
                    backgroundColor: tenant.theme.primaryColor || "#000000",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-slate-300 text-sm font-medium">
                Secondary Color
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {tenant.theme.secondaryColor || "#000000"}
                </span>
                <div
                  className="h-6 w-6 rounded shadow-inner border border-white/10"
                  style={{
                    backgroundColor: tenant.theme.secondaryColor || "#000000",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-slate-300 text-sm font-medium">
                Accent Color
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {tenant.theme.accentColor || "#000000"}
                </span>
                <div
                  className="h-6 w-6 rounded shadow-inner border border-white/10"
                  style={{
                    backgroundColor: tenant.theme.accentColor || "#000000",
                  }}
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 mb-3">
                <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                  Typography
                </span>
                <span className="text-white text-sm">
                  {tenant.theme.fontFamily || "Default sans-serif"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                  Hero Title
                </span>
                <span className="text-white text-sm">
                  {tenant.theme.heroTitle || "Not configured"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-all flex flex-col">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all"></div>

          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
              <Settings className="h-4 w-4" />
            </div>
            Configuration
          </h2>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                  Currency
                </span>
                <span className="text-white font-medium text-sm">
                  {tenant.settings?.currency || "USD"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                  Language
                </span>
                <span className="text-white font-medium text-sm">
                  {tenant.settings?.language || "EN"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">
                Contact Email
              </span>
              <span className="text-white text-sm">
                {tenant.settings?.email || "Not set"}
              </span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-500" />
            Feature Flags
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
            {tenant.settings?.features &&
              Object.entries(tenant.settings.features).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5"
                >
                  <span className="text-slate-300 text-xs capitalize font-medium">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <div
                    className={`w-8 h-4 rounded-full relative transition-colors ${
                      value ? "bg-purple-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                        value ? "left-4.5 right-0.5" : "left-0.5"
                      }`}
                      style={{ left: value ? "16px" : "2px" }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
