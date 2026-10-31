import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import ProductImage from "@/components/ProductImage";
import { getProduct, getCategories } from "@/lib/api";

type ProductDetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await getProduct(id);

    return {
      title: product.name,
      description:
        product.description ??
        `View price, stock, and details for ${product.name} at RevoShop.`,
    };
  } catch {
    return {
      title: "Product not found",
      description: "The requested product could not be found.",
    };
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailProps) {
  const { id } = await params;

  let product;

  try {
    product = await getProduct(id);
  } catch {
    notFound();
  }

  const categories = await getCategories();
  const categoryName =
    categories.find((category) => category.id === product.category_id)?.name ??
    `Category #${product.category_id}`;

  const isInStock = product.stock > 0;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="text-sm font-semibold text-orange-600 hover:text-orange-800"
      >
        Back to products
      </Link>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6 sm:p-8">
          <ProductImage name={product.name} className="mb-6 aspect-[16/10] w-full rounded-xl" />
          <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
            {categoryName}
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            {product.description ?? "No description available for this product."}
          </p>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">Price</p>
            <p className="mt-1 text-3xl font-bold text-orange-600">
              {formatPrice(Number(product.price))}
            </p>
          </div>
        </Card>

        <Card className="h-fit p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Availability
          </h2>

          <span
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              isInStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isInStock ? "In Stock" : "Out of Stock"}
          </span>

          <p className="mt-3 text-slate-600">
            {product.stock} unit(s) available
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Product ID: {product.id}
          </p>

          <Link
            href="/products"
            className="mt-6 block rounded-xl bg-orange-600 px-4 py-3 text-center font-semibold text-white hover:bg-orange-700"
          >
            Browse products
          </Link>
        </Card>
      </div>
    </section>
  );
}
