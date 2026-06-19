"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  products: { product: string; quantity: number; price: number }[];
  shippingAddress: { street: string; number: string; city: string; province: string; zipCode: string };
  trackingCode: string;
  totalAmount: number;
}

export default function ProfilePage() {
  const { config } = useTenant();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      if (!config) return;
      try {
        const profileData = await api.get("/users/profile", config.slug) as { name: string; email: string; points: number };
        if (!cancelled) setPoints(profileData.points || 0);

        const ordersData = await api.get("/orders/my-orders", config.slug) as Order[];
        if (!cancelled) setOrders(ordersData || []);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    loadData();

    return () => {
      cancelled = true;
    };
  }, [config, isAuthenticated, router]);

  if (!config || !user || !isAuthenticated) return null;

  const statusColors: Record<string, string> = {
    "Pendiente": "bg-yellow-500",
    "En Preparación": "bg-blue-500",
    "En Preparacion": "bg-blue-500",
    "Enviado": "bg-indigo-500",
    "Entregado": "bg-green-500",
    "Cancelado": "bg-red-500",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="bg-gray-50 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-500">Points</span>
            <p className="text-xl font-bold" style={{ color: config.theme.accentColor }}>{points}</p>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="px-4 py-2 rounded-lg border text-red-500 font-semibold hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <p className="text-gray-500">You haven&apos;t made any purchases yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <span className="font-bold">
                  Order from {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${statusColors[order.status] || "bg-gray-500"}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {order.products.map((p, i) => (
                  <span key={i} className="mr-4">
                    Product x{p.quantity} - <span className="font-bold">${p.price.toLocaleString()}</span>
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-end">
                <div className="text-sm">
                  <p><span className="font-bold">Ship to:</span> {order.shippingAddress.street} {order.shippingAddress.number}, {order.shippingAddress.city}</p>
                  <p><span className="font-bold">Tracking:</span> <span className="text-blue-600 font-bold">{order.trackingCode || "Not yet assigned"}</span></p>
                </div>
                <h4 className="font-bold text-green-600">Total: ${order.totalAmount.toLocaleString()}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
