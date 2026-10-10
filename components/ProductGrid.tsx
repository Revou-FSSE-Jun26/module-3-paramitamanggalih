"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import AddProductForm, { type NewProduct } from "@/components/AddProductForm";
import type { CartItem, Category, Product } from "@/types/product";

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

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") ?? "all"
  );
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

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
        (product.description ?? "").toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryId === "all" ||
        String(product.category_id) === categoryId;

      return matchesSearch && matchesCategory;
    });
  }, [products, localProducts, search, categoryId]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function handleAddToCart(item: {
    id?: number | string;
    name: string;
    price: number;
    quantity: number;
  }) {
    const itemId = item.id ?? item.name;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => String(cartItem.id) === String(itemId)
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          String(cartItem.id) === String(itemId)
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      return [...currentCart, { ...item, id: itemId }];
    });
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
            if (search.trim()) params.set("search", search.trim());
            else params.delete("search");
            if (categoryId !== "all") params.set("category", categoryId);
            else params.delete("category");

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
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(cartTotal)}
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
                categories.find((category) => category.id === product.category_id)
                  ?.name ??
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
