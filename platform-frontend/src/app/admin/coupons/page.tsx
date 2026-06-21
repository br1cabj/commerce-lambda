"use client";

import { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Trash, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  pointsRequired: number;
}

export default function AdminCouponsPage() {
  const { config } = useTenant();
  const { isAuthenticated, isAdmin, isHydrated } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [points, setPoints] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCoupons = useCallback(async () => {
    if (!config) return [];
    try {
      const data = (await api.get("/coupons", config.slug)) as
        | { results?: Coupon[] }
        | Coupon[];
      return Array.isArray(data) ? data : data.results || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading coupons");
      console.error("Error loading coupons:", err);
      return [];
    }
  }, [config]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !isAdmin) {
      router.push("/");
      return;
    }
    let ignore = false;
    (async () => {
      const result = await loadCoupons();
      if (!ignore) {
        setCoupons(result);
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAdmin, router, loadCoupons, isHydrated]);

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!config) return;
    try {
      await api.post(
        "/coupons",
        {
          code,
          discountPercentage: Number(discount),
          pointsRequired: Number(points),
        },
        config.slug,
      );
      setShowForm(false);
      setCode("");
      setDiscount("");
      setPoints("0");
      loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating coupon");
    }
  };

  const toggleCoupon = async (id: string) => {
    if (!config) return;
    try {
      await api.put(`/coupons/${id}`, {}, config.slug);
      loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error toggling coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!config || !confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`, config.slug);
      loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting coupon");
    }
  };

  if (!config) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: config.theme.accentColor }}
        >
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={createCoupon}
          className="bg-white rounded-xl shadow-sm border p-6 mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 rounded-lg border uppercase"
                placeholder="SAVE10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Discount %</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                min="1"
                max="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Points Required
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-semibold text-white"
              style={{ backgroundColor: config.theme.accentColor }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 rounded-lg border font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border p-4 animate-pulse h-16"
            />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-500 font-medium">No coupons created yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-lg">{coupon.code}</p>
                <p className="text-sm text-gray-500">
                  {coupon.discountPercentage}% discount
                  {coupon.pointsRequired > 0 &&
                    ` • Requires ${coupon.pointsRequired} points`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${coupon.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
                >
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => toggleCoupon(coupon._id)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  {coupon.isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => deleteCoupon(coupon._id)}
                  className="p-2 rounded hover:bg-red-50 text-red-500"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
