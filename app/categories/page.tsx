import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/Card";
import { getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore product categories available at RevoShop.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
        Browse by category
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Product Categories
      </h1>

      <p className="mt-3 text-slate-600">
        Explore our available categories and discover products for your needs.
      </p>

      {categories.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const productCount = products.filter(
              (product) => product.category_id === category.id
            ).length;

            return (
              <Card key={category.id} className="p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {category.name}
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  {productCount} product(s) in this category
                </p>

                <Link
                  href={`/products?category=${category.id}`}
                  className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  View products
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-semibold text-slate-800">
            No categories found
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Categories from the API will appear here when available.
          </p>
        </div>
      )}
    </section>
  );
}
