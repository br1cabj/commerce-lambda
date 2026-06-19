"use client";

import { useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Search, Package } from "lucide-react";

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  trackingCode: string;
  products: { product: string; quantity: number; price: number }[];
  totalAmount: number;
}

export default function TrackingPage() {
  const { config } = useTenant();
  const { isAuthenticated } = useAuth();
  const [trackingInput, setTrackingInput] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!config) return null;

  const statusSteps = ["Pendiente", "En Preparación", "Enviado", "Entregado"];
  const currentStep = order ? statusSteps.indexOf(order.status) : -1;

  const handleSearch = async () => {
    setError("");
    setOrder(null);

    if (!trackingInput.trim()) {
      return setError("Enter a tracking code or order ID.");
    }

    setLoading(true);
    try {
      if (isAuthenticated) {
        const orders = (await api.get(
          "/orders/my-orders",
          config.slug,
        )) as Order[];
        const found = orders.find(
          (o) =>
            o.trackingCode?.toLowerCase() === trackingInput.toLowerCase() ||
            o._id === trackingInput,
        );
        if (found) {
          setOrder(found);
        } else {
          setError("No order found with that tracking code.");
        }
      } else {
        setError("Please log in to track your orders.");
      }
    } catch (err) {
      setError("Error searching for your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
      <p className="text-gray-500 mb-8">
        Enter your tracking code or order ID to see the current status.
      </p>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="Enter tracking code (e.g., CP123456)"
            className="flex-1 px-4 py-3 rounded-lg border bg-gray-50"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            <Search className="h-4 w-4" /> Track
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {order && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package
              className="h-6 w-6"
              style={{ color: config.theme.accentColor }}
            />
            <div>
              <h3 className="font-bold">Order {order._id.slice(-6)}</h3>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200" />
            <div
              className="absolute top-4 left-0 h-1 transition-all duration-500"
              style={{
                width: `${currentStep >= 0 ? (currentStep / (statusSteps.length - 1)) * 100 : 0}%`,
                backgroundColor: config.theme.accentColor,
              }}
            />
            {statusSteps.map((step, i) => (
              <div
                key={step}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    i <= currentStep ? "" : "bg-gray-300"
                  }`}
                  style={
                    i <= currentStep
                      ? { backgroundColor: config.theme.accentColor }
                      : {}
                  }
                >
                  {i <= currentStep ? "✓" : i + 1}
                </div>
                <span className="text-xs mt-2 text-gray-600 text-center hidden sm:block">
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm">
              <span className="font-bold">Tracking Code:</span>{" "}
              <span className="text-blue-600 font-bold">
                {order.trackingCode || "Not yet assigned"}
              </span>
            </p>
            <p className="text-sm mt-2">
              <span className="font-bold">Total:</span> $
              {order.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
