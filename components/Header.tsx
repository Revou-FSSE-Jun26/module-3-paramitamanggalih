"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { cartCount, isLoaded: cartLoaded } = useCart();

  const navigation = [
    ...publicNavigation,
    ...(user?.role === "customer"
      ? [{ href: "/orders", label: "My Orders" }]
      : []),
    ...(user?.role === "admin"
      ? [
          { href: "/dashboard", label: "Admin" },
          { href: "/dashboard/categories", label: "Manage Categories" },
          { href: "/dashboard/orders", label: "Manage Orders" },
        ]
      : []),
  ];

  function isActiveRoute(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    logout();
    router.replace("/");
    router.refresh();
  }

  const cartActive = isActiveRoute("/cart");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-orange-600"
        >
          RevoShop
          <span className="ml-2 text-sm font-normal text-slate-500">
            Store
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-2"
        >
          {navigation.map((item) => {
            const active = isActiveRoute(item.href);
            const isAdminLink =
              user?.role === "admin" &&
              item.href.startsWith("/dashboard");

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-orange-600 text-white"
                    : isAdminLink
                      ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                      : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/cart"
            aria-current={cartActive ? "page" : undefined}
            aria-label={`Shopping cart, ${cartCount} items`}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              cartActive
                ? "bg-orange-600 text-white"
                : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <span>Cart</span>

            {cartLoaded && (
              <span
                className={`ml-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  cartActive
                    ? "bg-white text-orange-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {!isLoading && user ? (
            <>
              <span className="text-sm font-medium text-slate-700">
                Hi, {user.name}
              </span>

              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">
                {user.role}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : !isLoading ? (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-600"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Register
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}