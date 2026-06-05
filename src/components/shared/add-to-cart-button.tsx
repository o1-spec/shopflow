"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

type Props = {
    product: {
        _id: string;
        name: string;
        price: number;
        imageUrl: string;
    };
};

export function AddToCartButton({ product }: Props) {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <Button
            size="sm"
            onClick={() =>
                addItem({
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                })
            }
        >
            Add
        </Button>
    );
}