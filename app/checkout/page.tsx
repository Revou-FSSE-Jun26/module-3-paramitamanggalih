import type { Metadata } from "next";
import CheckoutPageClient from "@/components/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your RevoShop order.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
