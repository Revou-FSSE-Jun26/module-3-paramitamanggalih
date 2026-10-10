"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";

export interface ProductCardProps {
  id?: number | string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
  onAddToCart?: (item: {
    id?: number | string;
    name: string;
    price: number;
    quantity: number;
  }) => void;
}

export default function ProductCard({
  id,
  name,
  description = "No description available.",
  price,
  stock = 0,
  category = "General",
  onAddToCart,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const isInStock = stock > 0;

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

  function handleAddToCart() {
    if (!isInStock || !onAddToCart) return;

    onAddToCart({
      id,
      name,
      price,
      quantity,
    });
  }

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {category}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isInStock
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {isInStock ? `In Stock: ${stock}` : "Out of Stock"}
        </span>
      </div>

      <h2 className="text-lg font-bold text-slate-900">{name}</h2>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <p className="mt-5 text-xl font-bold text-blue-700">
        {formattedPrice}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">
          Quantity
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`Decrease quantity of ${name}`}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={!isInStock || quantity <= 1}
            className="h-9 w-9 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>

          <span className="min-w-5 text-center font-semibold" aria-live="polite">
            {quantity}
          </span>

          <button
            type="button"
            aria-label={`Increase quantity of ${name}`}
            onClick={() =>
              setQuantity((current) => Math.min(stock, current + 1))
            }
            disabled={!isInStock || quantity >= stock}
            className="h-9 w-9 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!isInStock || !onAddToCart}
        className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors ${
          isInStock && onAddToCart
            ? "bg-blue-700 hover:bg-blue-800"
            : "cursor-not-allowed bg-slate-400"
        }`}
      >
        {!isInStock ? "Unavailable" : "Add to Cart"}
      </button>

      {id !== undefined && (
        <Link
          href={`/products/${id}`}
          className="mt-3 block text-center text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          View details
        </Link>
      )}
    </Card>
  );
}

