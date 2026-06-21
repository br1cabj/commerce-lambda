"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useTenant } from "@/hooks/useTenant";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowLeft, Package, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function PaymentSuccessContent() {
  const { config } = useTenant();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(() => !!sessionId);

  const fetchOrderDetails = useCallback(async () => {
    if (!config) return "";
    try {
      if (sessionId) {
        const order = (await api.get(
          `/orders/by-session/${sessionId}`,
          config.slug,
        )) as { _id: string } | null;
        if (order?._id) return order._id;
      }

      const orders = (await api.get(
        "/orders/my-orders",
        config.slug,
      )) as Array<{ _id: string; createdAt: string }>;

      if (orders.length > 0) {
        const sorted = orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return sorted[0]._id;
      }
    } catch (err) {
      console.error("Error fetching order:", err);
    }
    return "";
  }, [config, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let ignore = false;
    (async () => {
      const id = await fetchOrderDetails();
      if (!ignore) {
        if (id) setOrderId(id);
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [sessionId, fetchOrderDetails]);

  if (!config) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">
            Your order has been confirmed and will be processed shortly.
          </p>

          {!loading && orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Order ID</span>
              </div>
              <p className="font-mono font-bold text-lg">
                #{orderId.slice(-8)}
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 mb-6 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading order details...</span>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: config.theme.primaryColor }}
            >
              <ArrowLeft className="h-4 w-4 inline mr-2" /> Back to Store
            </Link>
            <Link
              href="/profile"
              className="block w-full py-3 rounded-full font-semibold border hover:bg-gray-50 transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
