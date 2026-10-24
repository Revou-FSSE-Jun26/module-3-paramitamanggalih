import type { Metadata } from "next";
import ProductDashboardClient from "@/components/ProductDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage RevoShop products.",
};

export default function DashboardPage() {
  return <ProductDashboardClient />;
}
