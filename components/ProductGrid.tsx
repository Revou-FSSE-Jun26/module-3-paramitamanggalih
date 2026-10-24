"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import AddProductForm, { type NewProduct } from "@/components/AddProductForm";
import { useCart } from "@/context/CartContext";
import type { Category, Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
}

export default function ProductGrid({
  products,
  categories,
}: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { items, cartCount, cartTotal, addItem, updateQuantity } = useCart();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") ?? "all"
  );
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setCategoryId(searchParams.get("category") ?? "all");
  }, [searchParams]);

  function updateUrl(nextSearch: string, nextCategory: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    } else {
      params.delete("search");
    }

    if (nextCategory !== "all") {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const visibleProducts = useMemo(() => {
    const allProducts = [...products, ...localProducts];
    const normalizedSearch = search.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        categoryId === "all" ||
        String(product.category_id) === categoryId;

      return matchesSearch && matchesCategory;
    });
  }, [products, localProducts, search, categoryId]);

  function handleAddToCart(item: {
    id?: number | string;
    name: string;
    price: number;
    quantity: number;
  }) {
    if (typeof item.id !== "number") {
      toast.error("This product cannot be added to the cart.");
      return;
    }

    // Only database products can be checked out through the API.
    const product = products.find((candidate) => candidate.id === item.id);

    if (!product) {
      toast.error("This preview product is not saved in the database.");
      return;
    }

    if (product.stock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }

    const existingItem = items.find(
      (cartItem) => cartItem.id === product.id
    );

    const currentQuantity = existingItem?.quantity ?? 0;
    const nextQuantity = Math.min(
      product.stock,
      currentQuantity + item.quantity
    );

    if (nextQuantity === currentQuantity) {
      toast.error("You already have the maximum available stock in your cart.");
      return;
    }

    if (existingItem) {
      updateQuantity(product.id, nextQuantity);
    } else {
      for (let index = 0; index < nextQuantity; index += 1) {
        addItem({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
        });
      }
    }

    toast.success(`${product.name} added to cart.`);
  }

  function handleAddProduct(newProduct: NewProduct) {
    const matchedCategory = categories.find(
      (category) =>
        category.name.toLowerCase() === newProduct.category.toLowerCase()
    );

    const product: Product = {
      id: -Date.now(),
      name: newProduct.name,
      description: newProduct.description || null,
      price: newProduct.price,
      stock: newProduct.stock,
      category_id: matchedCategory?.id ?? 0,
      category: matchedCategory?.name ?? newProduct.category,
    };

    setLocalProducts((currentProducts) => [...currentProducts, product]);
  }

  const formattedCartTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(cartTotal);

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
          RevoShop Collection
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Product Catalog
        </h1>
        <p className="mt-2 text-slate-600">
          Discover products and find what you need.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();

            const params = new URLSearchParams(searchParams.toString());

            if (search.trim()) {
              params.set("search", search.trim());
            } else {
              params.delete("search");
            }

            if (categoryId !== "all") {
              params.set("category", categoryId);
            } else {
              params.delete("category");
            }

            const query = params.toString();

            router.push(query ? `${pathname}?${query}` : pathname, {
              scroll: false,
            });
          }}
          className="flex items-end gap-3"
        >
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(value) => {
                setSearch(value);
                updateUrl(value, categoryId);
              }}
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Search
          </button>
        </form>

        <div>
          <label
            htmlFor="category-filter"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Filter by category
          </label>

          <select
            id="category-filter"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              updateUrl(search, event.target.value);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 p-5">
        <div>
          <p className="text-sm text-slate-600">Shopping cart</p>
          <p className="text-lg font-bold text-slate-900">
            {cartCount} item(s)
          </p>
        </div>

        <p className="text-lg font-bold text-blue-700">
          {formattedCartTotal}
        </p>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description ?? undefined}
              price={Number(product.price)}
              stock={product.stock}
              category={
                product.category ??
                categories.find(
                  (category) => category.id === product.category_id
                )?.name ??
                "General"
              }
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            No products found
          </h2>
          <p className="mt-2 text-slate-500">
            Try a different search or category.
          </p>
        </div>
      )}

      <div className="border-t border-slate-200 pt-8">
        <AddProductForm onAddProduct={handleAddProduct} />
      </div>
    </section>
  );
}
