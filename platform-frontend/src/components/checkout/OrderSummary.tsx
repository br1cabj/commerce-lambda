import { Tag } from "lucide-react";
import Image from "next/image";
import type { TenantConfig } from "@/stores/tenantStore";

interface CartItem {
  id: string;
  model: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  config: TenantConfig;
  totalAmount: number;
  finalTotal: number;
  shippingCost: number;
  shippingName: string;
  shippingLoading: boolean;
  discountPercent: number;
  discountAmount: number;
  couponCode: string;
  couponApplied: boolean;
  applyingCoupon: boolean;
  couponMessage: string;
  setCouponCode: (val: string) => void;
  setCouponMessage: (val: string) => void;
  applyCoupon: () => void;
  removeCoupon: () => void;
}

export function OrderSummary({
  items,
  config,
  totalAmount,
  finalTotal,
  shippingCost,
  shippingName,
  shippingLoading,
  discountPercent,
  discountAmount,
  couponCode,
  couponApplied,
  applyingCoupon,
  couponMessage,
  setCouponCode,
  setCouponMessage,
  applyCoupon,
  removeCoupon,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-24">
      <h3 className="font-bold text-lg mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <Image
              src={item.image}
              alt={item.model}
              width={48}
              height={48}
              className="object-contain bg-gray-50 rounded"

            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{item.model}</p>
              <p className="text-xs text-gray-500">
                Size: {item.size} | Qty: {item.quantity}
              </p>
            </div>
            <span className="font-bold text-sm">
              ${(item.price * item.quantity).toLocaleString()}
            </span>
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
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponMessage("");
              }}
              placeholder="e.g., SAVE10"
              className="flex-1 px-3 py-2 rounded border text-sm uppercase"
              disabled={couponApplied}
            />
            {couponApplied ? (
              <button
                onClick={removeCoupon}
                className="px-3 py-2 rounded font-semibold text-sm text-white bg-red-500 hover:bg-red-600"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={applyCoupon}
                disabled={applyingCoupon}
                className="px-3 py-2 rounded font-semibold text-sm text-white disabled:opacity-50"
                style={{ backgroundColor: config.theme.primaryColor }}
              >
                <Tag className="h-4 w-4" />
              </button>
            )}
          </div>
          {couponMessage && (
            <p
              className={`text-xs mt-1 font-semibold ${couponApplied ? "text-green-600" : "text-red-500"}`}
            >
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
        <span>Shipping {shippingName ? `(${shippingName})` : ''}</span>
        <span className="font-bold text-gray-800 text-right">
          {shippingLoading ? (
            <span className="animate-pulse">Calculating...</span>
          ) : shippingCost > 0 ? (
            `$${shippingCost.toLocaleString()}`
          ) : config.settings.shippingMethods.find(
            (m: { type: string; enabled: boolean }) =>
              m.type === "free" && m.enabled,
          ) ? (
            <span className="text-emerald-600">Free Shipping</span>
          ) : (
            "Enter zip code to calculate"
          )}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold text-lg">Total</span>
        <span className="font-bold text-lg">
          ${finalTotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
