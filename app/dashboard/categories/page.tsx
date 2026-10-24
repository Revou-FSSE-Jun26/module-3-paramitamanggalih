import type { Metadata } from "next";
import CategoryDashboardClient from "@/components/CategoryDashboardClient";

export const metadata: Metadata = {
  title: "Category Management",
  description: "Manage RevoShop product categories.",
};

export default function DashboardCategoriesPage() {
  return <CategoryDashboardClient />;
}
