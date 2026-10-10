import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import { getProducts, getCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse products available at RevoShop.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductGrid
      products={products}
      categories={categories}
    />
  );
}
