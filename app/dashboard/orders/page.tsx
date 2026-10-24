import type { Metadata } from "next";
import AdminOrdersClient from "@/components/AdminOrdersClient";

export const metadata: Metadata = {
  title: "Order Management",
  description: "Review RevoShop customer orders.",
};

export default function DashboardOrdersPage() {
  return <AdminOrdersClient />;
}
