import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import { getProducts, getCategories } from "@/lib/api";
import {
  filterCatalogCategories,
  filterCatalogProducts,
} from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse products available at RevoShop.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [allProducts, allCategories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const products = filterCatalogProducts(allProducts);
  const categories = filterCatalogCategories(allCategories);

  return (
    <ProductGrid
      products={products}
      categories={categories}
    />
  );
}