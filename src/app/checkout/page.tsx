"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/shared/header";
import { CreditCard, Truck, User, RefreshCw } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = items.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;

    try {
      setLoading(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name,
            email,
          },
          items,
          subtotal,
        }),
      });

      const data = await response.json();
      clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans antialiased text-neutral-900">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Checkout</h1>
        <p className="text-xs text-neutral-500 mt-1 font-medium">Configure customer profile to trigger payment queue</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
          {/* Customer Details Form (7 cols) */}
          <form onSubmit={placeOrder} className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 border-neutral-150">
                <User className="h-4.5 w-4.5 text-indigo-500" />
                <h2 className="text-sm font-bold text-neutral-800">Customer Identity</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Full Name</label>
                  <Input
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-neutral-50 border-neutral-200 focus-visible:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Email Address</label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. john.doe@acme.corp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-50 border-neutral-200 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 border-neutral-150">
                <Truck className="h-4.5 w-4.5 text-indigo-500" />
                <h2 className="text-sm font-bold text-neutral-800">Logistics</h2>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Standard courier routing (SF-Express). Dispatch updates are automatically logged into the execution timeline once the `shipment_updates` queue resolves.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 shadow-lg shadow-indigo-600/10 gap-2 text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Enqueuing Asynchronous Transaction...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4.5 w-4.5 text-white" />
                  <span>Authorize Settlement of ${total.toFixed(2)}</span>
                </>
              )}
            </Button>
          </form>

          {/* Cart Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-neutral-800 border-b pb-3 border-neutral-150">Order Summary</h2>
              
              <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-neutral-900">{item.name}</p>
                      <p className="text-neutral-500 font-mono mt-0.5">${item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <span className="font-bold font-mono text-neutral-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-3 border-neutral-150 font-mono text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Logistics fee</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-3 border-t">
                  <span>Total Due</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}