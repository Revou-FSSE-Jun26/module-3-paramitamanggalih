"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminGuard from "@/components/AdminGuard";
import type { Category } from "@/types/product";

function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

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
    // Handle empty or non-JSON responses below.
  }

  return `Request failed (${response.status}).`;
}

export default function CategoryDashboardClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl("/categories"), {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data: unknown = await response.json();
      setCategories(Array.isArray(data) ? (data as Category[]) : []);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load categories.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function resetForm() {
    setName("");
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Category name is required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(
        apiUrl(
          editingId === null
            ? "/categories"
            : `/categories/${editingId}`
        ),
        {
          method: editingId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      toast.success(
        editingId === null
          ? "Category created successfully."
          : "Category updated successfully."
      );

      resetForm();
      await loadCategories();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save the category.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Delete category "${category.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(category.id);
    setError("");

    try {
      const response = await fetch(
        apiUrl(`/categories/${category.id}`),
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      toast.success("Category deleted successfully.");

      if (editingId === category.id) {
        resetForm();
      }

      await loadCategories();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete the category.";

      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminGuard>
      <section className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-orange-600 hover:text-orange-800"
          >
            ← Back to Product Dashboard
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-orange-600">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Category Management
          </h1>

          <p className="mt-2 text-slate-600">
            Create and manage the categories used by your products.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId === null ? "Add a category" : `Edit category #${editingId}`}
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="category-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category name
              </label>

              <input
                id="category-name"
                name="name"
                type="text"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="For example, Electronics"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingId === null
                    ? "Create Category"
                    : "Save Changes"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              Categories
            </h2>
            <span className="text-sm text-slate-500">
              {categories.length} total
            </span>
          </div>

          {isLoading ? (
            <p className="mt-5 text-slate-600">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
              No categories found. Create your first category above.
            </p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 last:border-b-0"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {category.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Category ID: {category.id}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(category.id);
                        setName(category.name);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === category.id}
                      onClick={() => void handleDelete(category)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === category.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </AdminGuard>
  );
}
