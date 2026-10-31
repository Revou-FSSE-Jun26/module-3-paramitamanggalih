"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPageClient() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const {
    items,
    isLoaded,
    cartCount,
    cartTotal,
    removeItem,
    updateQuantity,
  } = useCart();

  function handleCheckout() {
    if (items.length === 0) return;

    if (!user) {
      toast.error("Please log in before checkout.");
      router.push("/login?redirect=/checkout");
      return;
    }

    router.push("/checkout");
  }

  if (!isLoaded || authLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-slate-600">Loading your shopping cart...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          RevoShop
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Shopping Cart
        </h1>
        <p className="mt-2 text-slate-600">
          Review your items before placing your order.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-slate-600">
            Explore our catalog and add some products to your cart.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.id}`}
                    className="text-lg font-bold text-slate-900 hover:text-orange-600"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatCurrency(item.price)} each
                  </p>
                  <p className="mt-2 font-semibold text-orange-600">
                    Subtotal: {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeItem(item.id);
                        } else {
                          updateQuantity(item.id, item.quantity - 1);
                        }
                      }}
                      className="h-10 w-10 rounded-lg border border-slate-300 font-bold hover:bg-slate-100"
                    >
                      −
                    </button>

                    <span
                      className="min-w-6 text-center font-semibold"
                      aria-live="polite"
                    >
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      disabled={
                        typeof item.stock === "number" &&
                        item.quantity >= item.stock
                      }
                      onClick={() => {
                        if (
                          typeof item.stock === "number" &&
                          item.quantity >= item.stock
                        ) {
                          toast.error("No more stock is available.");
                          return;
                        }

                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      className="h-10 w-10 rounded-lg border border-slate-300 font-bold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.id);
                      toast.success(`${item.name} removed from cart.`);
                    }}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-2xl bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600">Total quantity</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {cartCount} item(s)
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-600">Order total</p>
                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {formatCurrency(cartTotal)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/products"
              className="mt-4 block text-center text-sm font-semibold text-orange-600 hover:text-orange-800"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
