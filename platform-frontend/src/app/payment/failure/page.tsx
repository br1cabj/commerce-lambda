"use client";

import { useTenant } from "@/hooks/useTenant";
import Link from "next/link";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";

export default function PaymentFailurePage() {
  const { config } = useTenant();

  if (!config) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-6">
            Your payment could not be processed. Your cart has been preserved so
            you can try again.
          </p>

          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">
              Common reasons: insufficient funds, card declined, or expired
              card. Please try a different payment method.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block w-full py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: config.theme.primaryColor }}
            >
              <ShoppingCart className="h-4 w-4 inline mr-2" /> Try Again
            </Link>
            <Link
              href="/"
              className="block w-full py-3 rounded-full font-semibold border hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 inline mr-2" /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
