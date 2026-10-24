import type { Metadata } from "next";
import OrdersPageClient from "@/components/OrdersPageClient";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View the orders placed by your RevoShop account.",
};

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return <OrdersPageClient />;
}
