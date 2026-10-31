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

interface OrderDetail {
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

function parseOrder(data: unknown): OrderDetail | null {
  if (typeof data !== "object" || data === null) return null;

  const outer = data as Record<string, unknown>;
  const candidate =
    typeof outer.order === "object" && outer.order !== null
      ? (outer.order as Record<string, unknown>)
      : outer;

  const id = Number(candidate.id);
  const userId = Number(candidate.user_id);
  const total = Number(candidate.total);

  if (
    !Number.isSafeInteger(id) ||
    !Number.isSafeInteger(userId) ||
    !Number.isFinite(total) ||
    typeof candidate.status !== "string" ||
    typeof candidate.created_at !== "string"
  ) {
    return null;
  }

  const rawItems = Array.isArray(candidate.items) ? candidate.items : [];

  const items: OrderItem[] = rawItems.flatMap((rawItem) => {
    if (typeof rawItem !== "object" || rawItem === null) return [];

    const item = rawItem as Record<string, unknown>;
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);
    const price = Number(item.price);

    if (
      !Number.isSafeInteger(productId) ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      !Number.isFinite(price)
    ) {
      return [];
    }

    return [{ product_id: productId, quantity, price }];
  });

  return {
    id,
    user_id: userId,
    total,
    status: candidate.status,
    created_at: candidate.created_at,
    items,
  };
}

export default function OrderDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const orderId = Number(id);

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadOrder() {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!apiBaseUrl) {
        setError("API URL is not configured.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${apiBaseUrl.replace(/\/$/, "")}/orders/${orderId}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        const data: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
              ? data.message
              : "Could not load the order.";

          throw new Error(message);
        }

        const parsedOrder = parseOrder(data);

        if (!parsedOrder || parsedOrder.id !== orderId) {
          setNotFound(true);
          return;
        }

        // Do not display an order belonging to another user.
        if (parsedOrder.user_id !== user!.id) {
          setNotFound(true);
          return;
        }

        setOrder(parsedOrder);
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name === "AbortError"
        ) {
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

    void loadOrder();

    return () => controller.abort();
  }, [authLoading, user, id, router]);

  if (authLoading || isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-slate-600">Loading order details...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-slate-600">Redirecting to login...</p>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Order not found
        </h1>
        <p className="mt-3 text-slate-600">
          This order does not exist or is not available to your account.
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
        >
          Back to My Orders
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/orders"
        className="text-sm font-semibold text-orange-600 hover:text-orange-800"
      >
        ← Back to My Orders
      </Link>

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {order && (
        <>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
              Order Details
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Order #{order.id}
            </h1>
            <p className="mt-3 text-slate-600">
              Placed on {new Date(order.created_at).toLocaleString("id-ID")}
            </p>
          </div>

          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Order status</p>
                <span className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold capitalize text-orange-600">
                  {order.status}
                </span>
              </div>

              <div className="sm:text-right">
                <p className="text-sm text-slate-500">Order total</p>
                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Purchased Items
            </h2>

            {order.items.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-200">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.product_id}-${index}`}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        Product #{item.product_id}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No items were recorded for this order.
              </p>
            )}
          </Card>
        </>
      )}
    </section>
  );
}
