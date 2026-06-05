import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddToCartButton } from "@/components/shared/add-to-cart-button";
import Link from "next/link";

export default async function HomePage() {
  await connectToDatabase();

  const products = await Product.find({ status: "active" })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">ShopFlow Storefront</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">
              Products
            </h1>
            <p className="mt-2 text-neutral-600">
              A real storefront generating operational jobs for QueueWatch.
            </p>
          </div>

          <Button asChild>
            <Link href="/cart">View Cart</Link>
          </Button>        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: any) => (
            <Card key={product._id.toString()} className="overflow-hidden">
              <div className="aspect-square bg-neutral-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <CardContent className="p-4">
                <h2 className="font-medium text-neutral-950">{product.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                  {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-semibold">${product.price}</p>
                  <AddToCartButton
                    product={{
                      _id: product._id.toString(),
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}