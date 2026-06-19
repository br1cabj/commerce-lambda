"use client";

import { useTenant } from "@/hooks/useTenant";
import Link from "next/link";

export default function TermsPage() {
  const { config } = useTenant();

  if (!config) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">1. General</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing and using {config.name}&apos;s online store, you agree to be bound by these Terms and Conditions.
            If you do not agree with any part of these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Products</h2>
          <p className="text-gray-600 leading-relaxed">
            All products displayed on our store are subject to availability. We reserve the right to modify prices,
            descriptions, and availability without prior notice. Product images are for illustrative purposes and may
            differ slightly from the actual product.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Orders</h2>
          <p className="text-gray-600 leading-relaxed">
            Orders are confirmed after payment verification. We reserve the right to cancel any order if there is an
            error in pricing, product description, or if the product is out of stock. You will be notified via WhatsApp
            or email if your order is cancelled.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Payment</h2>
          <p className="text-gray-600 leading-relaxed">
            Payment must be completed before your order is processed. We accept bank transfers and other payment
            methods as displayed at checkout. Prices are in {config.settings.currency}.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Shipping</h2>
          <p className="text-gray-600 leading-relaxed">
            Shipping costs are calculated based on your location and will be communicated before dispatch. Delivery
            times are estimates and may vary. We are not responsible for delays caused by the shipping carrier.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Returns & Refunds</h2>
          <p className="text-gray-600 leading-relaxed">
            You may request a return within 30 days of receiving your order. Products must be in their original
            condition with all tags attached. Shipping costs for returns are the responsibility of the customer
            unless the product is defective.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            Your personal information is collected solely for processing orders and improving our services. We do not
            sell or share your data with third parties except as required for order fulfillment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For any questions regarding these terms, please contact us at{" "}
            {config.settings.email && (
              <a href={`mailto:${config.settings.email}`} className="text-blue-600 hover:underline">
                {config.settings.email}
              </a>
            )}{" "}
            or via WhatsApp at {config.settings.whatsappNumber}.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t">
        <Link href="/" className="text-blue-600 hover:underline font-semibold">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
