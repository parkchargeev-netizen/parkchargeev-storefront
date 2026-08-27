import type { Metadata } from "next";

import { CartPageClient } from "@/components/shop/cart-page-client";
import { listPublicProducts } from "@/server/admin/repository";

export const metadata: Metadata = {
  title: "Sepetim",
  description: "Alisveris sepetiniz ve siparis ozetiniz.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function CartPage() {
  const suggestionProducts = (await listPublicProducts()).slice(0, 8);

  return <CartPageClient suggestionProducts={suggestionProducts} />;
}
