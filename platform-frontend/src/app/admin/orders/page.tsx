"use client";

import { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Package } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import Image from "next/image";

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  user: { name: string; email: string } | null;
  products: {
    product: {
      _id: string;
      model: string;
      brand: string;
      images?: string[];
    } | string | null;
    quantity: number;
    price: number;
  }[];
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
    Pendiente: "bg-amber-50 text-amber-700 border border-amber-200",
    "En Preparación": "bg-blue-50 text-blue-700 border border-blue-200",
    "En Preparacion": "bg-blue-50 text-blue-700 border border-blue-200",
    Enviado: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    Entregado: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Cancelado: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdminNav />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Orders Management</h2>
        {saveStatus && (
          <span
            className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-opacity ${
              saveStatus === "Saving..." ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {saveStatus}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-4 font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse h-40"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Order Header */}
              <div className="flex flex-wrap justify-between items-center bg-gray-50/50 px-5 py-4 border-b border-gray-100 gap-2">
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm">
                    Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-semibold">
                    Customer: <span className="font-bold text-gray-700">{order.user?.name || "Deleted User"}</span> ({order.user?.email || ""})
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      statusColors[order.status] || "bg-gray-100 text-gray-700 border"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Info Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                {/* Products */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Products</p>
                  <div className="space-y-3">
                    {order.products.map((p, i) => {
                      const productObj = (p.product && typeof p.product === "object") ? p.product : null;
                      const brand = productObj ? productObj.brand : "";
                      const model = productObj ? productObj.model : "Product";
                      const image = productObj && productObj.images?.length ? productObj.images[0] : null;

                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-50 rounded-lg p-1.5 border border-gray-100 flex items-center justify-center shrink-0">
                            {image ? (
                              <Image
                                src={image}
                                alt={model}
                                width={40}
                                height={40}
                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                              />
                            ) : (
                              <span className="text-gray-300 text-sm">📦</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-gray-800 leading-tight">
                              {model}
                            </h4>
                            <p className="text-[10px] font-semibold text-gray-400">
                              {brand ? `${brand} • ` : ""}x{p.quantity} @ ${p.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ship To Address</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {order.shippingAddress.street} {order.shippingAddress.number}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                </div>
              </div>

              {/* Order Status Action Panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50/20 px-5 py-4 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order._id, e.target.value, order.trackingCode)
                    }
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
                    placeholder="Enter Tracking Code"
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all flex-1 min-w-[180px]"
                    onBlur={(e) =>
                      updateStatus(order._id, order.status, e.target.value)
                    }
                  />
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Paid</span>
                    <span className="font-extrabold text-lg text-emerald-600">
                      ${order.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
