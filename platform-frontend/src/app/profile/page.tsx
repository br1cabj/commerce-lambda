"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";

interface Order {
  _id: string;
  createdAt: string;
  status: string;
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
    zipCode: string;
  };
  trackingCode: string;
  totalAmount: number;
}

export default function ProfilePage() {
  const { config } = useTenant();
  const { user, logout, isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      if (!config) return;
      try {
        const profileData = (await api.get("/users/profile", config.slug)) as {
          name: string;
          email: string;
          points: number;
        };
        if (!cancelled) setPoints(profileData.points || 0);

        const ordersResponse = (await api.get(
          "/orders/my-orders",
          config.slug,
        )) as { results: Order[] };
        if (!cancelled) setOrders(ordersResponse.results || []);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    loadData();

    return () => {
      cancelled = true;
    };
  }, [config, isAuthenticated, router, isHydrated]);

  if (!config || !user || !isAuthenticated) return null;

  const statusColors: Record<string, string> = {
    Pendiente: "bg-amber-50 text-amber-700 border border-amber-200",
    "En Preparación": "bg-blue-50 text-blue-700 border border-blue-200",
    "En Preparacion": "bg-blue-50 text-blue-700 border border-blue-200",
    Enviado: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    Entregado: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Cancelado: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner"
              style={{ backgroundColor: config.theme.accentColor }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Loyalty Points</span>
              <p
                className="text-2xl font-black leading-none mt-0.5"
                style={{ color: config.theme.accentColor }}
              >
                {points}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="h-fit px-5 py-2.5 rounded-xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 hover:border-red-200 transition-all text-sm shrink-0"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <h2 className="text-xl font-extrabold text-gray-900 mb-5">My Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="text-4xl block mb-3">📦</span>
          <p className="text-gray-500 font-medium">
            You haven&apos;t made any purchases yet.
          </p>
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
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                    Order ID: #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    statusColors[order.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Order Products */}
              <div className="px-5 divide-y divide-gray-100">
                {order.products.map((p, i) => {
                  const productObj = (p.product && typeof p.product === "object") ? p.product : null;
                  const brand = productObj ? productObj.brand : "";
                  const model = productObj ? productObj.model : "Product";
                  const image = productObj && productObj.images?.length ? productObj.images[0] : null;

                  return (
                    <div key={i} className="flex items-center gap-4 py-4">
                      <div className="h-12 w-12 bg-gray-50 rounded-xl p-1.5 border border-gray-100 flex items-center justify-center shrink-0">
                        {image ? (
                          <Image
                            src={image}
                            alt={model}
                            width={48}
                            height={48}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <span className="text-gray-300 text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {brand && (
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                            {brand}
                          </p>
                        )}
                        <h4 className="font-bold text-sm text-gray-800 truncate">
                          {model}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-gray-900">
                          x{p.quantity} - ${(p.price * p.quantity).toLocaleString()}
                        </p>
                        {p.quantity > 1 && (
                          <p className="text-[10px] text-gray-400 font-medium">
                            ${p.price.toLocaleString()} each
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/20 px-5 py-4 border-t border-gray-100 gap-4">
                <div className="text-xs space-y-1">
                  <p className="text-gray-500 font-medium">
                    <span className="font-bold text-gray-700">Ship to:</span>{" "}
                    {order.shippingAddress.street}{" "}
                    {order.shippingAddress.number}, {order.shippingAddress.city}
                  </p>
                  <p className="text-gray-500 font-medium">
                    <span className="font-bold text-gray-700">Tracking:</span>{" "}
                    <span className="text-blue-600 font-bold">
                      {order.trackingCode || "Not yet assigned"}
                    </span>
                  </p>
                </div>
                <div className="text-right sm:self-center shrink-0">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Amount</span>
                  <span className="font-black text-xl text-emerald-600">
                    ${order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
