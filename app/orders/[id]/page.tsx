import type { Metadata } from "next";
import OrderDetailClient from "@/components/OrderDetailClient";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View the details of your RevoShop order.",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrderDetailClient id={id} />;
}
