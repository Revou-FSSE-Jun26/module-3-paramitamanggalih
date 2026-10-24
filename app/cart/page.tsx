import type { Metadata } from "next";
import CartPageClient from "@/components/CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your RevoShop shopping cart.",
};

export default function CartPage() {
  return <CartPageClient />;
}
