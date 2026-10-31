import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import ProductImage from "@/components/ProductImage";
import { getCategory } from "@/lib/api";
import {
  filterCatalogProducts,
  isCatalogCategory,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const category = await getCategory(id);

    if (!isCatalogCategory(category)) {
      return { title: "Category Not Found" };
    }

    return {
      title: `${category.name} Products`,
      description: `Explore products in the ${category.name} category at RevoShop.`,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("404")
    ) {
      return { title: "Category Not Found" };
    }

    return { title: "Category Details | RevoShop" };
  }
}

export default async function CategoryDetailPage({
  params,
}: CategoryPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    notFound();
  }

  let category;

  try {
    category = await getCategory(id);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("404")
    ) {
      notFound();
    }

    throw error;
  }

  if (!isCatalogCategory(category)) {
    notFound();
  }

  const products = filterCatalogProducts(category.products);

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Link
          href="/categories"
          className="text-sm font-semibold text-orange-600 hover:text-orange-800"
        >
          ← Back to Categories
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-orange-600">
          Product Category
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {category.name}
        </h1>

        <p className="mt-2 text-slate-600">
          {products.length} product(s) available in this category.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="flex h-full flex-col p-6">
              <ProductImage
                name={product.name}
                className="mb-5 aspect-[4/3] w-full rounded-xl"
              />

              <h2 className="text-xl font-bold text-slate-900">
                {product.name}
              </h2>

              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {product.description || "No description available."}
              </p>

              <p className="mt-5 text-xl font-bold text-orange-600">
                {formatPrice(product.price)}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                {product.stock > 0
                  ? `In stock: ${product.stock}`
                  : "Out of stock"}
              </p>

              <Link
                href={`/products/${product.id}`}
                className="mt-5 inline-flex justify-center rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700"
              >
                View Product
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No products in this category
          </h2>
          <p className="mt-2 text-slate-600">
            Products assigned to this category will appear here.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Browse All Products
          </Link>
        </div>
      )}
    </section>
  );
}