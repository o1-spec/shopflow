"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-neutral-900 tracking-tight text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/10">
              SF
            </div>
            <span>ShopFlow</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-neutral-600">
            <Link href="/" className="hover:text-neutral-950 transition-colors">Storefront</Link>
            <Link href="/admin" className="hover:text-neutral-950 transition-colors">Admin Console</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors sm:hidden">
            <LayoutDashboard className="h-4 w-4" />
            <span>Admin</span>
          </Link>
          
          <Link 
            href="/cart" 
            className="relative p-2.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-center justify-center shadow-sm"
          >
            <ShoppingCart className="h-4 w-4 text-neutral-700" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-sm border border-white hover:bg-indigo-600">
                {itemCount}
              </Badge>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
