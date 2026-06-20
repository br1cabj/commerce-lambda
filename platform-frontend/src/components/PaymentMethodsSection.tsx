"use client";

import { CreditCard, ShieldCheck } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import type { Translation } from "@/stores/tenantStore";

interface PaymentMethodsProps {
  title: Translation;
  subtitle: Translation;
  accentColor: string;
  primaryColor: string;
  paymentMethods: { type: string; enabled: boolean }[];
}

const paymentMethodLogos: Record<string, { name: string; colors: string[] }> = {
  visa: {
    name: "VISA",
    colors: ["#1a1f71", "#f7b600"],
  },
  mastercard: {
    name: "MasterCard",
    colors: ["#eb001b", "#f79e1b"],
  },
  amex: {
    name: "AMEX",
    colors: ["#006fcf", "#006fcf"],
  },
  paypal: {
    name: "PayPal",
    colors: ["#003087", "#009cde"],
  },
  stripe: {
    name: "Stripe",
    colors: ["#635bff", "#635bff"],
  },
  mercadopago: {
    name: "MercadoPago",
    colors: ["#009ee3", "#009ee3"],
  },
  applepay: {
    name: "Apple Pay",
    colors: ["#000000", "#000000"],
  },
  googlepay: {
    name: "Google Pay",
    colors: ["#4285f4", "#34a853"],
  },
  transfer: {
    name: "Transfer",
    colors: ["#6b7280", "#6b7280"],
  },
  whatsapp: {
    name: "WhatsApp",
    colors: ["#25d366", "#25d366"],
  },
};

function PaymentLogo({ type }: { type: string }) {
  const method = paymentMethodLogos[type.toLowerCase()];
  if (!method) {
    return (
      <div className="flex items-center justify-center h-10 px-4 bg-gray-100 rounded-lg">
        <CreditCard className="h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-10 px-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      <span className="font-bold text-sm" style={{ color: method.colors[0] }}>
        {method.name}
      </span>
    </div>
  );
}

export function PaymentMethodsSection({
  title,
  subtitle,
  accentColor,
  primaryColor,
  paymentMethods,
}: PaymentMethodsProps) {
  const { t } = useTranslations();

  const enabledMethods = paymentMethods.filter((m) => m.enabled);
  if (enabledMethods.length === 0) return null;

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <ShieldCheck className="h-6 w-6" style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg" style={{ color: primaryColor }}>
                {t(title)}
              </h3>
              <p className="text-gray-500 text-sm">{t(subtitle)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {enabledMethods.map((method) => (
              <PaymentLogo key={method.type} type={method.type} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
