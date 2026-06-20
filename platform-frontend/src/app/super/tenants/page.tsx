"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Plus, Edit, Trash2, Power, PowerOff, Search, X } from "lucide-react";
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
    return () => { ignore = true; };
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
    free: "bg-gray-100 text-gray-700",
    basic: "bg-blue-100 text-blue-700",
    premium: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Store Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Store
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stores by name, slug, or owner email..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border p-6 mb-6 space-y-4"
        >
          <h2 className="text-lg font-bold">
            {editingTenant
              ? `Editing: ${editingTenant.name}`
              : "Create New Store"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Store Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
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
                className="w-full px-4 py-2 rounded-lg border"
                placeholder="my-store"
                required
              />
            </div>
            {!editingTenant && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Owner Email
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Owner Password
                  </label>
                  <input
                    type="password"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border"
                    minLength={6}
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-bold mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) =>
                  setPlan(e.target.value as "free" | "basic" | "premium")
                }
                className="w-full px-4 py-2 rounded-lg border"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-semibold text-white bg-gray-900 hover:bg-gray-800"
            >
              {editingTenant ? "Update" : "Create"} Store
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-6 py-2 rounded-lg border font-semibold"
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
              className="bg-white rounded-xl shadow-sm border p-4 animate-pulse h-20"
            />
          ))}
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-500 font-medium">No stores found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Store</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-bold">{tenant.name}</span>
                    <p className="text-xs text-gray-500">
                      {tenant.slug}.yourplatform.com
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{tenant.owner?.name || "N/A"}</p>
                    <p className="text-xs text-gray-500">
                      {tenant.owner?.email || ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold capitalize ${planColors[tenant.plan]}`}
                    >
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${tenant.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {tenant.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <Link
                        href={`/super/tenants/${tenant._id}`}
                        className="p-1.5 rounded hover:bg-gray-100"
                        title="View"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Link>
                      <button
                        onClick={() => toggleStatus(tenant._id)}
                        className="p-1.5 rounded hover:bg-gray-100"
                        title={tenant.isActive ? "Suspend" : "Activate"}
                      >
                        {tenant.isActive ? (
                          <PowerOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Power className="h-4 w-4 text-green-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(tenant)}
                        className="p-1.5 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => deleteTenant(tenant._id)}
                        className="p-1.5 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
