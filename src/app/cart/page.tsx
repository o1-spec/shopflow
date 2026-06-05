"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/header";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans antialiased text-neutral-900">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Shopping Cart</h1>
        <p className="text-xs text-neutral-500 mt-1">Review products before checking out</p>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-350 bg-white p-16 text-center shadow-sm">
            <div className="p-4 bg-indigo-50 rounded-full border border-indigo-100">
              <ShoppingBag className="h-10 w-10 text-indigo-500" />
            </div>
            <h2 className="mt-4 text-base font-bold text-neutral-800">Your cart is empty</h2>
            <p className="mt-1.5 text-xs text-neutral-500 max-w-xs leading-relaxed">
              Explore the product catalog to add mock items and generate processing queues.
            </p>
            <Button asChild className="mt-6 bg-indigo-650 hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <Link href="/">Back to Catalog</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
            {/* Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-300 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/50 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500 font-mono mt-1">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <p className="text-sm font-bold text-neutral-950 font-mono">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeItem(item.productId)}
                      className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Pricing Panel (4 cols) */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-neutral-800 pb-3 border-b">Summary</h3>
                
                <div className="space-y-3 font-mono text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-neutral-900 pt-3 border-t">
                    <span>Order Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 shadow-lg shadow-indigo-600/10 gap-2">
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}