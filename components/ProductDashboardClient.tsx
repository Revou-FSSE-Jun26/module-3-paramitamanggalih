"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Category, Product } from "@/types/product";
import AdminGuard from "@/components/AdminGuard";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  category_id: "",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  return `${base.replace(/\/$/, "")}${path}`;
}

async function getErrorMessage(response: Response) {
  try {
    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  } catch {
    // The API may return an empty or non-JSON response.
  }

  return `Request failed (${response.status}).`;
}

export default function ProductDashboardClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(apiUrl("/products"), { cache: "no-store" }),
        fetch(apiUrl("/categories"), { cache: "no-store" }),
      ]);

      if (!productsResponse.ok) {
        throw new Error(await getErrorMessage(productsResponse));
      }

      if (!categoriesResponse.ok) {
        throw new Error(await getErrorMessage(categoriesResponse));
      }

      const productData = (await productsResponse.json()) as Product[];
      const categoryData = (await categoriesResponse.json()) as Category[];

      setProducts(Array.isArray(productData) ? productData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load products.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
      category_id: String(product.category_id),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);
    const categoryId = Number(form.category_id);

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid non-negative price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a non-negative whole number.");
      return;
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      toast.error("Please choose a category.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(
        apiUrl(editingId === null ? "/products" : `/products/${editingId}`),
        {
          method: editingId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            price,
            stock,
            category_id: categoryId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      toast.success(
        editingId === null
          ? "Product created successfully."
          : "Product updated successfully."
      );

      resetForm();
      await loadData();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save the product.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setError("");

    try {
      const response = await fetch(apiUrl(`/products/${product.id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      toast.success("Product deleted successfully.");

      if (editingId === product.id) resetForm();

      await loadData();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete the product.";

      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminGuard>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Product Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Create, update, and manage products in your store.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/categories"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage Categories →
            </Link>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage Orders →
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total products</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Categories</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {categories.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Units in stock</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {products.reduce((total, product) => total + Number(product.stock), 0)}
            </p>
          </div>
        </div>

        <section
          id="product-form"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-bold text-slate-900">
            {editingId === null ? "Add a product" : `Edit product #${editingId}`}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="product-name" className="mb-2 block text-sm font-semibold text-slate-700">
                Product name
              </label>
              <input
                id="product-name"
                name="name"
                required
                maxLength={150}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label htmlFor="product-category" className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                id="product-category"
                name="category_id"
                required
                value={form.category_id}
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-2 text-sm text-amber-700">
                  Create a category before adding products.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="product-price" className="mb-2 block text-sm font-semibold text-slate-700">
                Price (IDR)
              </label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label htmlFor="product-stock" className="mb-2 block text-sm font-semibold text-slate-700">
                Stock
              </label>
              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={(event) => setForm({ ...form, stock: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="product-description" className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                id="product-description"
                name="description"
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={isSaving || categories.length === 0}
                className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingId === null
                    ? "Create Product"
                    : "Save Changes"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {error && (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-slate-900">Products</h2>

          {isLoading ? (
            <p className="mt-5 text-slate-600">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
              No products found.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Product</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="mt-1 max-w-xs truncate text-slate-500">
                          {product.description || "No description"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {categories.find((category) => category.id === product.category_id)?.name ?? product.category ?? `#${product.category_id}`}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {product.stock}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(product)}
                            className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === product.id}
                            onClick={() => void handleDelete(product)}
                            className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === product.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </AdminGuard>
  );
}

