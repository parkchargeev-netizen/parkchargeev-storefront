import type { Metadata } from "next";

import { CartPageClient } from "@/components/shop/cart-page-client";

export const metadata: Metadata = {
  title: "Sepetim",
  description: "Alışveriş sepetiniz ve sipariş özetiniz."
};

export default function CartPage() {
  return <CartPageClient />;
}
