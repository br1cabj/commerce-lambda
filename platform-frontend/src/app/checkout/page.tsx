"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MessageCircle, CreditCard, Wallet } from "lucide-react";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import toast from "react-hot-toast";

type PaymentMethod = "whatsapp" | "mercadopago" | "stripe";

export default function CheckoutPage() {
  const { config } = useTenant();
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, isHydrated } = useAuth();
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
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod>("whatsapp");

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [shippingCost, setShippingCost] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingName, setShippingName] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        localStorage.setItem("redirectAfterLogin", "/checkout");
      }
      router.push("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isAuthenticated && items.length === 0) {
      router.push("/cart");
    }
  }, [isAuthenticated, items.length, router]);

  useEffect(() => {
    if (zipCode.length >= 4 && config) {
      const fetchShipping = async () => {
        setShippingLoading(true);
        try {
          const data = (await api.post("/shipping/calculate", {
            postalCodeDestination: zipCode,
            weight: items.reduce((acc, item) => acc + (item.quantity * 1), 0) // Assume 1kg per item for now since frontend cart doesn't store weight
          }, config.slug)) as { price?: number; productName?: string };
          
          setShippingCost(data.price || 0);
          setShippingName(data.productName || "Envío");
        } catch (err) {
          console.error("Shipping error:", err);
          setShippingCost(0);
          setShippingName("");
        } finally {
          setShippingLoading(false);
        }
      };

      const debounceId = setTimeout(fetchShipping, 1000);
      return () => clearTimeout(debounceId);
    } else {
      Promise.resolve().then(() => {
        setShippingCost(0);
        setShippingName("");
      });
    }
  }, [zipCode, items, config]);

  const discountAmount = totalAmount * (discountPercent / 100);
  const finalTotal = totalAmount - discountAmount + shippingCost;

  const availableMethods: PaymentMethod[] = useMemo(() => {
    const methods = (config?.settings.paymentMethods || [])
      .filter((m: { enabled: boolean }) => m.enabled)
      .map((m: { type: string }) => m.type as PaymentMethod);
    if (methods.length === 0) {
      return ["whatsapp" as PaymentMethod];
    }
    return methods;
  }, [config?.settings.paymentMethods]);

  if (!config || !isAuthenticated || items.length === 0) return null;

  const validateForm = (): string | null => {
    if (!fullName.trim()) return "Full name is required.";
    if (!dni.trim()) return "ID number is required.";
    if (!street.trim()) return "Street is required.";
    if (!number.trim()) return "Street number is required.";
    if (!city.trim()) return "City is required.";
    if (!province.trim()) return "Province is required.";
    if (!zipCode.trim()) return "Postal code is required.";
    return null;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponMessage("");

    try {
      const data = (await api.post(
        "/coupons/validate",
        { code: couponCode },
        config.slug,
      )) as {
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
      toast.success(`${data.discountPercentage}% discount applied!`, { icon: '🎟️' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid coupon";
      setCouponMessage(msg);
      toast.error(msg);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setDiscountPercent(0);
    setCouponCode("");
    setCouponMessage("");
  };

  const processWhatsAppOrder = async () => {
    setLoading(true);
    setError("");

    const orderProducts = items.map((item) => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData: Record<string, unknown> = {
      products: orderProducts,
      shippingAddress: { street, number, city, province, zipCode },
      shippingCost,
    };
    if (couponApplied && couponCode) {
      orderData.couponCode = couponCode;
    }

    try {
      const data = (await api.post("/orders", orderData, config.slug)) as {
        orderId: string;
      };

      const phoneNumber = config.settings.whatsappNumber || "";
      let wspText = `*Hello ${config.name}! I just placed an order.*\n`;
      wspText += `Order ID: #${data.orderId || Math.floor(Math.random() * 10000)}\n\n`;
      wspText += `*Customer:* ${fullName}\n`;
      wspText += `*ID:* ${dni}\n\n`;
      wspText += `*Order Details:*\n`;
      items.forEach((item) => {
        wspText += `- ${item.model} (Size: ${item.size}) x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}\n`;
      });
      wspText += `\n*Shipping Address:*\n${street} ${number}, ${city}, ${province} (${zipCode})\n\n`;
      if (shippingCost > 0) {
        wspText += `*Shipping (${shippingName}):* $${shippingCost.toLocaleString()}\n`;
      }
      if (discountPercent > 0) {
        wspText += `*Discount:* -${discountPercent}% (-$${discountAmount.toLocaleString()})\n`;
      }
      wspText += `*TOTAL: $${finalTotal.toLocaleString()}*\n\n`;
      wspText += `_Looking forward to coordinating shipping and payment. Thank you!_`;

      clearCart();

      toast.success("Order placed successfully! Redirecting to WhatsApp...");

      if (phoneNumber) {
        window.open(
          `https://wa.me/${phoneNumber}?text=${encodeURIComponent(wspText)}`,
          "_blank",
        );
      }

      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error processing order";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const processMercadoPagoOrder = async () => {
    setLoading(true);
    setError("");

    const orderProducts = items.map((item) => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const payload: Record<string, unknown> = {
        products: orderProducts,
        shippingAddress: { street, number, city, province, zipCode },
      };
      if (couponApplied && couponCode) {
        payload.couponCode = couponCode;
      }

      const data = (await api.post(
        "/payments/mercadopago/create-preference",
        payload,
        config.slug,
      )) as { initPoint: string };

      clearCart();
      window.location.href = data.initPoint;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error creating payment";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const processStripeOrder = async () => {
    setLoading(true);
    setError("");

    const orderProducts = items.map((item) => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const payload: Record<string, unknown> = {
        products: orderProducts,
        shippingAddress: { street, number, city, province, zipCode },
      };
      if (couponApplied && couponCode) {
        payload.couponCode = couponCode;
      }

      const data = (await api.post(
        "/payments/stripe/create-session",
        payload,
        config.slug,
      )) as { url: string };

      clearCart();
      window.location.href = data.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error creating payment";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

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

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-1">Street</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Number</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Province</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50"
                  required
                />
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="font-bold text-lg mb-4">Payment Method</h3>
            <div className="space-y-3">
              {availableMethods.map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedPayment === method
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
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
                      <p className="font-bold text-sm">
                        {paymentLabels[method]}
                      </p>
                      {method === "whatsapp" && (
                        <p className="text-xs text-gray-500">
                          Coordinate shipping and payment via WhatsApp
                        </p>
                      )}
                      {method === "mercadopago" && (
                        <p className="text-xs text-gray-500">
                          Pay securely with MercadoPago
                        </p>
                      )}
                      {method === "stripe" && (
                        <p className="text-xs text-gray-500">
                          Pay with credit or debit card
                        </p>
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
              {loading
                ? "Processing..."
                : `Pay $${finalTotal.toLocaleString()} with ${paymentLabels[selectedPayment]}`}
            </button>
          </form>
        </div>

            <OrderSummary
              items={items}
              config={config}
              totalAmount={totalAmount}
              finalTotal={finalTotal}
              shippingCost={shippingCost}
              shippingName={shippingName}
              shippingLoading={shippingLoading}
              discountPercent={discountPercent}
              discountAmount={discountAmount}
              couponCode={couponCode}
              couponApplied={couponApplied}
              applyingCoupon={applyingCoupon}
              couponMessage={couponMessage}
              setCouponCode={setCouponCode}
              setCouponMessage={setCouponMessage}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
            />
      </div>
    </div>
  );
}
