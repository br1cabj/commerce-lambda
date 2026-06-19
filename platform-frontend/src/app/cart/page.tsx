"use client";

import { useCart } from "@/hooks/useCart";
import { useTenant } from "@/hooks/useTenant";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { config } = useTenant();
  const { items, removeItem, updateQuantity, totalItems, totalAmount } =
    useCart();
  const router = useRouter();

  if (!config) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full font-semibold text-white"
          style={{ backgroundColor: config.theme.primaryColor }}
        >
          Go to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          {items.map((item, index) => (
            <div
              key={`${item.id}-${item.size}-${index}`}
              className="flex items-center gap-6 py-6 border-b border-gray-100 last:border-b-0"
            >
              <div className="h-32 w-32 bg-gray-50 rounded-2xl p-3 flex items-center justify-center shrink-0 border border-gray-100">
                <img
                  src={item.image}
                  alt={item.model}
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {item.brand}
                </p>
                <Link
                  href={`/product/${item.id}`}
                  className="hover:opacity-80 transition-opacity"
                >
                  <h3 className="font-bold text-lg text-gray-800">
                    {item.model}
                  </h3>
                </Link>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  Size: <span className="text-gray-800">{item.size}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="font-bold w-10 text-center text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="font-extrabold text-xl text-gray-900">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs font-medium text-gray-400">
                    ${item.price.toLocaleString()} each
                  </p>
                )}
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 text-sm font-semibold mt-3 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-7 h-fit sticky top-24 border border-gray-100">
          <h3 className="font-extrabold text-xl mb-6 text-gray-800">
            Order Summary
          </h3>
          <div className="flex justify-between mb-3 text-gray-500 font-medium">
            <span>Subtotal</span>
            <span className="font-bold text-gray-800">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between mb-6 text-gray-500 font-medium pb-6 border-b border-gray-200">
            <span>Shipping</span>
            <span className="font-bold text-gray-800 text-right">
              {config.settings.shippingMethods.find(
                (m: any) => m.type === "free" && m.enabled,
              ) ? (
                <span className="text-emerald-600">Free Shipping</span>
              ) : (
                "Calculated at checkout"
              )}
            </span>
          </div>
          <div className="flex justify-between mb-8">
            <span className="font-black text-2xl text-gray-900">Total</span>
            <span className="font-black text-2xl text-gray-900">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full py-4 rounded-full font-bold text-lg text-white transition-transform hover:scale-105 shadow-md"
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            Proceed to Checkout
          </button>
          <Link
            href="/catalog"
            className="block w-full py-3 text-center rounded-full font-bold text-gray-600 border-2 border-gray-200 mt-3 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
