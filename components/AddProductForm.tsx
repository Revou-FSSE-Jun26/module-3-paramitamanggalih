"use client";

import { useState } from "react";

export interface NewProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

interface AddProductFormProps {
  onAddProduct: (product: NewProduct) => void;
}

export default function AddProductForm({
  onAddProduct,
}: AddProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!name.trim() || !category.trim() || !price || !stock) {
      setError("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      setError("Stock must be a whole number and cannot be negative.");
      return;
    }

    onAddProduct({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      stock: numericStock,
      category: category.trim(),
    });

    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("");
    setError("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900">Add a Product</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the details of the new product.
        </p>
      </div>

      <div>
        <label htmlFor="new-product-name" className="mb-1 block text-sm font-medium">
          Product name *
        </label>
        <input
          id="new-product-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label htmlFor="new-product-description" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="new-product-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="new-product-price" className="mb-1 block text-sm font-medium">
            Price (IDR) *
          </label>
          <input
            id="new-product-price"
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="new-product-stock" className="mb-1 block text-sm font-medium">
            Stock *
          </label>
          <input
            id="new-product-stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="new-product-category" className="mb-1 block text-sm font-medium">
          Category *
        </label>
        <input
          id="new-product-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-800"
      >
        Add Product
      </button>
    </form>
  );
}
