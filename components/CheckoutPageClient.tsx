"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface OrderResponse {
  message?: string;
  id?: number;
  order?: {
    id?: number;
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPageClient() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const {
    items,
    isLoaded,
    cartTotal,
    clearCart,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/checkout");
    }
  }, [authLoading, user, router]);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty. Add products before checking out.");
      return;
    }

    if (
      items.some(
        (item) =>
          !Number.isInteger(item.id) ||
          item.id <= 0 ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      setError(
        "Your cart contains an invalid product. Remove it and add a product from the database."
      );
      return;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      setError("API URL is not configured.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiBaseUrl.replace(/\/$/, "")}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            items: items.map((item) => ({
              product_id: item.id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data = (await response.json()) as OrderResponse;

      if (!response.ok) {
        throw new Error(data.message || "Could not place your order.");
      }

      clearCart();
      toast.success("Your order has been placed successfully!");
      router.replace("/orders");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not connect to the server.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || !isLoaded) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-slate-600">Loading checkout...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-slate-600">Redirecting to login...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          RevoShop
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Checkout
        </h1>
        <p className="mt-2 text-slate-600">
          Review your order before confirming your purchase.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Nothing to check out
          </h2>
          <p className="mt-2 text-slate-600">
            Your shopping cart is empty.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleCheckout}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Customer information
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Order placed by {user.name} ({user.email})
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Order summary
            </h2>

            <div className="divide-y divide-slate-200">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="text-right font-semibold text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-5">
            <span className="font-semibold text-slate-700">Total</span>
            <span className="text-2xl font-bold text-orange-600">
              {formatCurrency(cartTotal)}
            </span>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Placing order..." : "Confirm Order"}
          </button>

          <Link
            href="/cart"
            className="block text-center text-sm font-semibold text-orange-600 hover:text-orange-800"
          >
            Back to Cart
          </Link>
        </form>
      )}
    </section>
  );
}
