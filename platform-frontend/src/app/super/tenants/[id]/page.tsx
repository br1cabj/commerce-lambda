"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Power, PowerOff } from "lucide-react";

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
  const router = useRouter();
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center text-gray-500 py-12">Store not found.</div>
    );
  }

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    basic: "bg-blue-100 text-blue-700",
    premium: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/super/tenants"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold">{tenant.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${planColors[tenant.plan]}`}
          >
            {tenant.plan}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${tenant.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {tenant.isActive ? "Active" : "Suspended"}
          </span>
          <button
            onClick={toggleStatus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${tenant.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
          >
            {tenant.isActive ? (
              <PowerOff className="h-4 w-4" />
            ) : (
              <Power className="h-4 w-4" />
            )}
            {tenant.isActive ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Store Info</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Slug:</span>{" "}
              <span className="font-mono font-bold">{tenant.slug}</span>
            </div>
            <div>
              <span className="text-gray-500">URL:</span>{" "}
              <span className="font-mono">{tenant.slug}.yourplatform.com</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>{" "}
              {new Date(tenant.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="text-gray-500">Owner:</span> {tenant.owner?.name}
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              {tenant.owner?.email}
            </div>
          </div>
          <a
            href={`http://${tenant.slug}.localhost:3000`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> Visit Store
          </a>
        </div>

        {/* Theme */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Theme</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20">Primary</span>
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: tenant.theme.primaryColor }}
              />
              <span className="text-xs font-mono">
                {tenant.theme.primaryColor}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20">Secondary</span>
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: tenant.theme.secondaryColor }}
              />
              <span className="text-xs font-mono">
                {tenant.theme.secondaryColor}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20">Accent</span>
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: tenant.theme.accentColor }}
              />
              <span className="text-xs font-mono">
                {tenant.theme.accentColor}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Font:</span>{" "}
              {tenant.theme.fontFamily}
            </div>
            <div>
              <span className="text-sm text-gray-500">Hero:</span>{" "}
              {tenant.theme.heroTitle}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Settings</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Currency:</span>{" "}
              {tenant.settings.currency}
            </div>
            <div>
              <span className="text-gray-500">Language:</span>{" "}
              {tenant.settings.language}
            </div>
            <div>
              <span className="text-gray-500">WhatsApp:</span>{" "}
              {tenant.settings.whatsappNumber || "Not set"}
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              {tenant.settings.email || "Not set"}
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>{" "}
              {tenant.settings.phone || "Not set"}
            </div>
          </div>

          <h3 className="font-bold mt-4 mb-2 text-sm">Features</h3>
          <div className="space-y-1">
            {Object.entries(tenant.settings.features).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {value ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
