"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
    const { items, removeItem } = useCartStore();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-10">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-semibold">Cart</h1>

                <div className="mt-8 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.productId}
                            className="flex items-center justify-between rounded-xl border bg-white p-4"
                        >
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-neutral-500">
                                    ${item.price} × {item.quantity}
                                </p>
                            </div>

                            <Button variant="outline" onClick={() => removeItem(item.productId)}>
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t pt-6">
                    <p className="text-lg font-semibold">Subtotal: ${subtotal.toFixed(2)}</p>

                    <Button asChild disabled={items.length === 0}>
                        <Link href="/checkout">Checkout</Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}