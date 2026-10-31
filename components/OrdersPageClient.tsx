"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/Card";

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function readOrders(data: unknown): Order[] {
  if (Array.isArray(data)) {
    return data as Order[];
  }

  if (typeof data === "object" && data !== null) {
    const response = data as { orders?: unknown };

    if (Array.isArray(response.orders)) {
      return response.orders as Order[];
    }
  }

  return [];
}

export default function OrdersPageClient() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const controller = new AbortController();

    async function loadOrders() {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!apiBaseUrl) {
        setError("API URL is not configured.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const query = new URLSearchParams({
          user_id: String(user!.id),
          limit: "20",
          offset: "0",
        });

        const response = await fetch(
          `${apiBaseUrl.replace(/\/$/, "")}/orders?${query.toString()}`,
          { signal: controller.signal, cache: "no-store" }
        );

        const data: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
              ? data.message
              : "Could not load your orders.";

          throw new Error(message);
        }

        const result = readOrders(data);

        // Keep the page scoped to the current user, even if the API
        // unexpectedly returns records belonging to other users.
        setOrders(result.filter((order) => order.user_id === user!.id));
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not connect to the server."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => controller.abort();
  }, [authLoading, user, router]);

  if (authLoading || isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-slate-600">Loading your orders...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-slate-600">Redirecting to login...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
        My Account
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        My Orders
      </h1>

      <p className="mt-3 text-slate-600">
        View the orders placed by your account.
      </p>

      {error && (
        <div role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Order #{order.id}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleString("id-ID")}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {order.items?.length ?? 0} product line(s)
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold capitalize text-orange-600">
                    {order.status}
                  </span>

                  <p className="mt-2 text-xl font-bold text-orange-600">
                    {formatPrice(order.total)}
                  </p>

                  <Link
                    href={`/orders/${order.id}`}
                    className="mt-3 inline-block text-sm font-semibold text-orange-600 hover:text-orange-800"
                  >
                    View order details →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            No orders yet
          </h2>

          <p className="mt-2 text-slate-500">
            Your purchases will appear here after you place an order.
          </p>

          <Link
            href="/products"
            className="mt-5 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Browse Products
          </Link>
        </div>
      )}
    </section>
  );
}
