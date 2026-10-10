import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import { getProducts, getCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover featured products at RevoShop.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const featuredProducts = products.slice(0, 5);

  return (
    <>
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Welcome to RevoShop
          </p>

          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Find products you will love.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-blue-100">
            Explore our featured collection and discover products for your
            everyday needs.
          </p>

          <a
            href="/products"
            className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            Browse all products
          </a>
        </div>
      </section>

      <ProductGrid
        products={featuredProducts}
        categories={categories}
      />
    </>
  );
}
