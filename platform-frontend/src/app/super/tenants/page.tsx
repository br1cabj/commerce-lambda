"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Search,
  X,
  Store,
} from "lucide-react";
import Link from "next/link";

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  plan: string;
  createdAt: string;
  owner: { name: string; email: string };
}

interface TenantsResponse {
  info: { total: number; currentPage: number; totalPages: number };
  results: Tenant[];
}

export default function SuperTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [plan, setPlan] = useState<"free" | "basic" | "premium">("free");

  const loadTenants = useCallback(async () => {
    try {
      const data = (await api.get(
        "/super/tenants?limit=100",
      )) as TenantsResponse;
      return data.results || [];
    } catch (err) {
      console.error("Error loading tenants:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    loadTenants().then((result) => {
      if (!ignore) {
        setTenants(result);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [loadTenants]);

  const resetForm = () => {
    setName("");
    setSlug("");
    setOwnerName("");
    setOwnerEmail("");
    setOwnerPassword("");
    setPlan("free");
    setEditingTenant(null);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setName(tenant.name);
    setSlug(tenant.slug);
    setPlan(tenant.plan as "free" | "basic" | "premium");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body: Record<string, string> = {
      name,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      plan,
    };

    if (!editingTenant) {
      body.ownerName = ownerName;
      body.ownerEmail = ownerEmail;
      body.ownerPassword = ownerPassword;
    }

    try {
      if (editingTenant) {
        await api.put(`/super/tenants/${editingTenant._id}`, body);
      } else {
        await api.post("/super/tenants", body);
      }
      setShowForm(false);
      resetForm();
      loadTenants();
    } catch (err) {
      console.error("Error saving tenant:", err);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.put(`/super/tenants/${id}/toggle-status`, {});
      loadTenants();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const deleteTenant = async (id: string) => {
    if (!confirm("Delete this store permanently? This cannot be undone."))
      return;
    try {
      await api.delete(`/super/tenants/${id}`);
      loadTenants();
    } catch (err) {
      console.error("Error deleting tenant:", err);
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.owner?.email.toLowerCase().includes(search.toLowerCase()),
  );

  const planColors: Record<string, string> = {
    free: "bg-slate-800 text-slate-300 border-slate-700",
    basic: "bg-blue-900/40 text-blue-300 border-blue-700/50",
    premium: "bg-purple-900/40 text-purple-300 border-purple-700/50",
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Store Management
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Manage all platform tenants, configure plans, and control access.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Deploy New Store
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stores by name, slug, or owner email..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all shadow-inner"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {editingTenant ? (
              <>
                <Edit className="h-5 w-5 text-blue-400" /> Editing:{" "}
                {editingTenant.name}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-purple-400" /> Create New Store
              </>
            )}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Slug (subdomain)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="my-store"
                required
              />
            </div>
            {!editingTenant && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Owner Email
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Owner Password
                  </label>
                  <input
                    type="password"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    minLength={6}
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Plan Level
              </label>
              <select
                value={plan}
                onChange={(e) =>
                  setPlan(e.target.value as "free" | "basic" | "premium")
                }
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transition-all active:scale-95"
            >
              {editingTenant ? "Save Changes" : "Deploy Store"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-6 py-2.5 rounded-xl font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tenants List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-2xl border border-white/10 p-4 animate-pulse h-20"
            />
          ))}
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="bg-white/5 rounded-3xl border border-white/10 p-16 text-center backdrop-blur-sm">
          <Store className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium text-lg">No stores found.</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-white/10 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Store Details</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold">Subscription</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Deployed On</th>
                  <th className="px-6 py-4 font-semibold text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant._id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-base">
                        {tenant.name}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500/50"></span>
                        {tenant.slug}.yourplatform.com
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200">
                        {tenant.owner?.name || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {tenant.owner?.email || ""}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${planColors[tenant.plan]}`}
                      >
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          tenant.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${tenant.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}
                        ></span>
                        {tenant.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(tenant.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <Link
                          href={`/super/tenants/${tenant._id}`}
                          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-slate-400 transition-colors"
                          title="Manage Tenant"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => toggleStatus(tenant._id)}
                          className={`p-2 rounded-lg bg-white/5 transition-colors ${
                            tenant.isActive
                              ? "hover:bg-orange-500/20 hover:text-orange-400 text-slate-400"
                              : "hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400"
                          }`}
                          title={
                            tenant.isActive ? "Suspend Store" : "Activate Store"
                          }
                        >
                          {tenant.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(tenant)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 text-slate-400 transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTenant(tenant._id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
                          title="Delete Permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
