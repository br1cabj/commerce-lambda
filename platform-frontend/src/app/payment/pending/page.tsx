"use client";

import { useTenant } from "@/hooks/useTenant";
import Link from "next/link";
import { Clock, ArrowLeft, MessageCircle } from "lucide-react";

export default function PaymentPendingPage() {
  const { config } = useTenant();

  if (!config) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-yellow-500" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Payment Pending</h1>
          <p className="text-gray-500 mb-6">
            Your payment is being processed. You will receive a confirmation
            once it is complete.
          </p>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700">
              For bank transfers or cash payments, it may take up to 24 hours to
              confirm. We will notify you via email once your payment is
              verified.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/profile"
              className="block w-full py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: config.theme.primaryColor }}
            >
              View My Orders
            </Link>
            {config.settings.whatsappNumber && (
              <a
                href={`https://wa.me/${config.settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold border hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Contact Support
              </a>
            )}
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
