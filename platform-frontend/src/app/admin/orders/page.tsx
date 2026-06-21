"use client";

import { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Package } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  user: { name: string; email: string } | null;
  products: { product: string; quantity: number; price: number }[];
  shippingAddress: {
    street: string;
    number: string;
    city: string;
    province: string;
  };
  trackingCode: string;
  totalAmount: number;
}

export default function AdminOrdersPage() {
  const { config } = useTenant();
  const { isAuthenticated, isAdmin, isHydrated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const loadOrders = useCallback(async () => {
    if (!config) return [];
    try {
      const data = (await api.get("/orders/all", config.slug)) as
        | { results?: Order[] }
        | Order[];
      return Array.isArray(data) ? data : data.results || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading orders");
      console.error("Error loading orders:", err);
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
      const result = await loadOrders();
      if (!ignore) {
        setOrders(result);
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAdmin, router, loadOrders, isHydrated]);

  const updateStatus = async (
    orderId: string,
    status: string,
    trackingCode: string,
  ) => {
    if (!config) return;
    setSaveStatus("Saving...");
    try {
      await api.put(
        `/orders/update-status/${orderId}`,
        { status, trackingCode },
        config.slug,
      );
      loadOrders();
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating order");
      console.error("Error updating order:", err);
      setSaveStatus("");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!config || !confirm("Delete this order?")) return;
    try {
      await api.delete(`/orders/${orderId}`, config.slug);
      loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting order");
      console.error("Error deleting order:", err);
    }
  };

  if (!config) return null;

  const statusColors: Record<string, string> = {
    Pendiente: "bg-yellow-100 text-yellow-800",
    "En Preparación": "bg-blue-100 text-blue-800",
    "En Preparacion": "bg-blue-100 text-blue-800",
    Enviado: "bg-indigo-100 text-indigo-800",
    Entregado: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        {saveStatus && (
          <span
            className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-opacity ${saveStatus === "Saving..." ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
          >
            {saveStatus}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border p-6 animate-pulse h-32"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold">Order #{order._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} -{" "}
                    {order.user?.name || "Deleted User"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-100"}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Products</p>
                  {order.products.map((p, i) => (
                    <p key={i} className="text-sm">
                      x{p.quantity} - ${p.price.toLocaleString()}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ship to</p>
                  <p className="text-sm">
                    {order.shippingAddress.street}{" "}
                    {order.shippingAddress.number}, {order.shippingAddress.city}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value, order.trackingCode)
                  }
                  className="px-3 py-2 rounded-lg border text-sm"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Preparación">En Preparación</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>

                <input
                  type="text"
                  defaultValue={order.trackingCode}
                  placeholder="Tracking code"
                  className="px-3 py-2 rounded-lg border text-sm flex-1 min-w-[200px]"
                  onBlur={(e) =>
                    updateStatus(order._id, order.status, e.target.value)
                  }
                />

                <span className="font-bold text-green-600">
                  ${order.totalAmount.toLocaleString()}
                </span>

                <button
                  onClick={() => deleteOrder(order._id)}
                  className="ml-auto px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
