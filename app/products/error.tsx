"use client";

interface ProductsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({
  error,
  reset,
}: ProductsErrorProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
        Something went wrong
      </p>

      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        Products could not be loaded
      </h1>

      <p className="mt-3 text-slate-600">
        RevoShop could not retrieve product information. Check that the Flask
        API is running, then try again.
      </p>

      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 break-words text-sm text-red-600">
          {error.message}
        </p>
      )}

      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
      >
        Try again
      </button>
    </section>
  );
}
