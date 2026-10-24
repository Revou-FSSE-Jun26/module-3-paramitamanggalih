"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminGuard from "@/components/AdminGuard";

interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
}

const PAGE_SIZE = 20;

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
      }

      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });

      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/orders?${params.toString()}`,
        { cache: "no-store" }
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : `Failed to load orders (${response.status}).`;

        throw new Error(message);
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the orders API.");
      }

      setOrders(data as Order[]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load orders.";

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <AdminGuard>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-blue-700">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Order Management
          </h1>

          <p className="mt-2 text-slate-600">
            Review customer orders. This page is read-only.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="mt-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-slate-600">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No orders found
            </h2>
            <p className="mt-2 text-slate-600">
              No orders were returned for this page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">Order</th>
                  <th className="px-5 py-4 font-semibold">Customer ID</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Item lines</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      #{order.id}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {order.user_id}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(order.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {Array.isArray(order.items) ? order.items.length : 0}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Page {pageNumber} · Up to {PAGE_SIZE} orders per page
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={offset === 0 || isLoading}
              onClick={() =>
                setOffset((current) => Math.max(0, current - PAGE_SIZE))
              }
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={orders.length < PAGE_SIZE || isLoading}
              onClick={() => setOffset((current) => current + PAGE_SIZE)}
              className="rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </AdminGuard>
  );
}
