"use client";

import { useCart } from "@/hooks/useCart";
import { useTenant } from "@/hooks/useTenant";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { config } = useTenant();
  const { items, removeItem, updateQuantity, totalItems, totalAmount } = useCart();
  const router = useRouter();

  if (!config) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
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
            <div key={`${item.id}-${item.size}-${index}`} className="flex items-center gap-4 py-4 border-b last:border-b-0">
              <img src={item.image} alt={item.model} className="h-24 w-24 object-contain bg-gray-50 rounded-lg p-2" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase">{item.brand}</p>
                <h3 className="font-bold text-sm">{item.model}</h3>
                <p className="text-xs text-gray-500">Size: {item.size}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="p-1 rounded border hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="p-1 rounded border hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${item.price.toLocaleString()}</p>
                <p className="text-sm text-green-600 font-bold">${(item.price * item.quantity).toLocaleString()}</p>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 text-sm font-semibold mt-1 hover:underline"
                >
                  <Trash2 className="h-4 w-4 inline mr-1" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="flex justify-between mb-2 text-gray-500">
            <span>Subtotal</span>
            <span className="font-bold">${totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-500 pb-4 border-b">
            <span>Shipping</span>
            <span className="font-bold text-green-600">To be arranged</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg">${totalAmount.toLocaleString()}</span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            Proceed to Checkout
          </button>
          <Link
            href="/"
            className="block w-full py-2 text-center rounded-full font-semibold border mt-2 hover:bg-gray-100"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
