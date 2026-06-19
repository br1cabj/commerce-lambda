"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Tag, MessageCircle, CreditCard, Wallet } from "lucide-react";

type PaymentMethod = "whatsapp" | "mercadopago" | "stripe";

export default function CheckoutPage() {
  const { config } = useTenant();
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("whatsapp");

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const discountAmount = totalAmount * (discountPercent / 100);
  const finalTotal = totalAmount - discountAmount;

  const paymentMethods = config?.settings.paymentMethods || [];
  const availableMethods: PaymentMethod[] = paymentMethods
    .filter(m => m.enabled)
    .map(m => m.type as PaymentMethod);

  if (availableMethods.length === 0) {
    availableMethods.push("whatsapp");
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      localStorage.setItem("redirectAfterLogin", "/checkout");
    }
    router.push("/login");
    return null;
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  if (!config) return null;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponMessage("");

    try {
      const data = await api.post("/coupons/validate", { code: couponCode }, config.slug) as {
        discountPercentage: number;
        pointsRequired: number;
      };

      if (data.pointsRequired > 0) {
        setCouponMessage(`This coupon requires ${data.pointsRequired} points.`);
        setApplyingCoupon(false);
        return;
      }

      setDiscountPercent(data.discountPercentage);
      setCouponApplied(true);
      setCouponMessage(`${data.discountPercentage}% discount applied!`);
    } catch (err) {
      setCouponMessage(err instanceof Error ? err.message : "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const processWhatsAppOrder = async () => {
    setLoading(true);
    setError("");

    const orderProducts = items.map(item => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData = {
      products: orderProducts,
      shippingAddress: { street, number, city, province, zipCode },
      shippingCost: 0,
    };

    try {
      const data = await api.post("/orders", orderData, config.slug) as { orderId: string };

      const phoneNumber = config.settings.whatsappNumber || "";
      let wspText = `*Hello ${config.name}! I just placed an order.*\n`;
      wspText += `Order ID: #${data.orderId || Math.floor(Math.random() * 10000)}\n\n`;
      wspText += `*Customer:* ${fullName}\n`;
      wspText += `*ID:* ${dni}\n\n`;
      wspText += `*Order Details:*\n`;
      items.forEach(item => {
        wspText += `- ${item.model} (Size: ${item.size}) x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}\n`;
      });
      wspText += `\n*Shipping Address:*\n${street} ${number}, ${city}, ${province} (${zipCode})\n\n`;
      if (discountPercent > 0) {
        wspText += `*Discount:* -${discountPercent}% (-$${discountAmount.toLocaleString()})\n`;
      }
      wspText += `*TOTAL: $${finalTotal.toLocaleString()}*\n\n`;
      wspText += `_Looking forward to coordinating shipping and payment. Thank you!_`;

      clearCart();

      if (phoneNumber) {
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(wspText)}`, "_blank");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing order");
    } finally {
      setLoading(false);
    }
  };

  const processMercadoPagoOrder = async () => {
    setLoading(true);
    setError("");

    const orderProducts = items.map(item => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const data = await api.post("/payments/mercadopago/create-preference", {
        products: orderProducts,
        shippingAddress: { street, number, city, province, zipCode },
      }, config.slug) as { initPoint: string };

      clearCart();
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating payment");
      setLoading(false);
    }
  };

  const processStripeOrder = async () => {
    setLoading(true);
    setError("");

    const orderProducts = items.map(item => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const data = await api.post("/payments/stripe/create-session", {
        products: orderProducts,
        shippingAddress: { street, number, city, province, zipCode },
      }, config.slug) as { url: string };

      clearCart();
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating payment");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPayment === "whatsapp") {
      await processWhatsAppOrder();
    } else if (selectedPayment === "mercadopago") {
      await processMercadoPagoOrder();
    } else if (selectedPayment === "stripe") {
      await processStripeOrder();
    }
  };

  const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
    whatsapp: <MessageCircle className="h-5 w-5" />,
    mercadopago: <Wallet className="h-5 w-5" />,
    stripe: <CreditCard className="h-5 w-5" />,
  };

  const paymentLabels: Record<PaymentMethod, string> = {
    whatsapp: "WhatsApp + Transfer",
    mercadopago: "MercadoPago",
    stripe: "Credit Card (Stripe)",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6">Shipping Address</h2>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-gray-50" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">ID Number</label>
                <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-gray-50" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-1">Street</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-gray-50" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Number</label>
                <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-gray-50" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-gray-50" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Province</label>
                <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-gray-50" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Postal Code</label>
                <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-gray-50" required />
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="font-bold text-lg mb-4">Payment Method</h3>
            <div className="space-y-3">
              {availableMethods.map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedPayment === method ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={selectedPayment === method}
                    onChange={() => setSelectedPayment(method)}
                    className="accent-gray-900 h-4 w-4"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    {paymentIcons[method]}
                    <div>
                      <p className="font-bold text-sm">{paymentLabels[method]}</p>
                      {method === "whatsapp" && (
                        <p className="text-xs text-gray-500">Coordinate shipping and payment via WhatsApp</p>
                      )}
                      {method === "mercadopago" && (
                        <p className="text-xs text-gray-500">Pay securely with MercadoPago</p>
                      )}
                      {method === "stripe" && (
                        <p className="text-xs text-gray-500">Pay with credit or debit card</p>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-bold text-lg text-white transition-transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: config.theme.primaryColor }}
            >
              {loading ? "Processing..." : `Pay $${finalTotal.toLocaleString()} with ${paymentLabels[selectedPayment]}`}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.image} alt={item.model} className="h-12 w-12 object-contain bg-gray-50 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.model}</p>
                  <p className="text-xs text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-sm">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {config.settings.features.coupons && (
            <div className="mb-4 bg-gray-50 rounded-lg p-3 border">
              <label className="text-xs font-bold mb-2 block">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponMessage(""); }}
                  placeholder="e.g., SAVE10"
                  className="flex-1 px-3 py-2 rounded border text-sm uppercase"
                  disabled={couponApplied}
                />
                <button
                  onClick={applyCoupon}
                  disabled={applyingCoupon || couponApplied}
                  className="px-3 py-2 rounded font-semibold text-sm text-white disabled:opacity-50"
                  style={{ backgroundColor: config.theme.primaryColor }}
                >
                  <Tag className="h-4 w-4" />
                </button>
              </div>
              {couponMessage && (
                <p className={`text-xs mt-1 font-semibold ${couponApplied ? "text-green-600" : "text-red-500"}`}>
                  {couponMessage}
                </p>
              )}
            </div>
          )}

          <hr className="mb-4" />
          <div className="flex justify-between mb-2 text-gray-500 text-sm">
            <span>Subtotal</span>
            <span className="font-bold">${totalAmount.toLocaleString()}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between mb-2 text-red-500 text-sm">
              <span>Discount ({discountPercent}%)</span>
              <span className="font-bold">-${discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between mb-4 text-gray-500 text-sm pb-4 border-b">
            <span>Shipping</span>
            <span className="font-bold text-green-600">To be arranged</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg">${finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
