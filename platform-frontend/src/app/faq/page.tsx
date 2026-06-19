"use client";

import { useTenant } from "@/hooks/useTenant";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqData = [
  { q: "How do I place an order?", a: "Browse our catalog, select your desired products, add them to your cart, and proceed to checkout. You will be redirected to WhatsApp to confirm shipping and payment details." },
  { q: "What payment methods do you accept?", a: "We accept bank transfers. After placing your order, we will share our bank details via WhatsApp for you to complete the payment." },
  { q: "How long does shipping take?", a: "Shipping times vary depending on your location. Typically, orders are dispatched within 2-5 business days. You will receive a tracking code once your order ships." },
  { q: "Can I return a product?", a: "Yes, you can request a return within 30 days of receiving your order. The product must be in its original condition with all tags attached. Contact us via WhatsApp to initiate the process." },
  { q: "How do I track my order?", a: "Once your order is shipped, you will receive a tracking code via WhatsApp. You can also check your order status in your profile under 'My Orders'." },
  { q: "Do you ship nationwide?", a: "Yes, we ship to all regions. Shipping costs are calculated based on your location and will be communicated to you before dispatch." },
  { q: "How do discount coupons work?", a: "Enter your coupon code at checkout. If valid, the discount will be applied to your order total. Some coupons may require loyalty points to redeem." },
  { q: "How do I earn loyalty points?", a: "You earn points with every purchase. The number of points varies by product. Points can be redeemed for exclusive discount coupons." },
];

export default function FAQPage() {
  const { config } = useTenant();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!config) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-8">Find answers to common questions about our store.</p>

      <div className="space-y-3">
        {faqData.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold pr-4">{faq.q}</span>
              {openIndex === i ? (
                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-xl p-6 text-center">
        <p className="font-bold text-lg mb-2">Still have questions?</p>
        <p className="text-gray-500 mb-4">Contact us and we will be happy to help.</p>
        {config.settings.whatsappNumber && (
          <a
            href={`https://wa.me/${config.settings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            Chat on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
