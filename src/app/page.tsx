import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Card, CardContent } from "@/components/ui/card";
import { AddToCartButton } from "@/components/shared/add-to-cart-button";
import { Header } from "@/components/shared/header";
import { Activity, ShieldCheck, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectToDatabase();

  const products = await Product.find({ status: "active" })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Premium SRE-themed Hero Section */}
        <section className="relative overflow-hidden border-b border-neutral-200 bg-white py-16 sm:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f3_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f3_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-6 relative">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-3 py-1 text-xs font-semibold text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Simulation Storefront</span>
              </div>
              
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
                ShopFlow Operations
              </h1>
              
              <p className="mt-4 text-base text-neutral-600 leading-relaxed">
                Interact with this storefront to generate real, complex transaction loads. Every action enqueues asynchronous BullMQ jobs monitored live by the QueueWatch agent.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 text-xs font-mono font-medium text-neutral-500">
                <div className="flex items-center gap-1.5 bg-neutral-100 border px-3 py-1.5 rounded-lg">
                  <Zap className="h-3.5 w-3.5 text-indigo-500" />
                  <span>5 BullMQ Queues</span>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-100 border px-3 py-1.5 rounded-lg">
                  <Activity className="h-3.5 w-3.5 text-rose-500" />
                  <span>Interactive Outages</span>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-100 border px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>QueueWatch Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid Showcase */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex items-baseline justify-between border-b pb-4 border-neutral-200">
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">Catalog Products</h2>
            <p className="text-xs text-neutral-500 font-medium">Select items to populate checkout cart</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product: any) => (
              <Card 
                key={product._id.toString()} 
                className="overflow-hidden border border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col group"
              >
                {/* Image container with zoom effect on hover */}
                <div className="aspect-square bg-neutral-100 overflow-hidden relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-neutral-200/60 shadow-sm">
                    <p className="text-xs font-extrabold text-neutral-900">${product.price}</p>
                  </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                    <p className="mt-1 text-xs text-neutral-500 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      Stock: {product.stock}
                    </span>
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
    </div>
  );
}