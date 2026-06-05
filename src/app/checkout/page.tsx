"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    async function placeOrder() {
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
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-2xl px-6 py-10">
            <h1 className="text-3xl font-semibold">
                Checkout
            </h1>

            <div className="mt-8 space-y-4">
                <Input
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Button
                    className="w-full"
                    onClick={placeOrder}
                    disabled={loading}
                >
                    {loading
                        ? "Creating Order..."
                        : `Pay $${subtotal.toFixed(2)}`}
                </Button>
            </div>
        </main>
    );
}