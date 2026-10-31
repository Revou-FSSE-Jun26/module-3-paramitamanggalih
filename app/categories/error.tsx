"use client";

interface CategoriesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoriesError({
  error,
  reset,
}: CategoriesErrorProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-900">
        Categories could not be loaded
      </h1>

      <p className="mt-3 text-slate-600">
        RevoShop could not retrieve categories. Check that the Flask API is
        running, then try again.
      </p>

      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 break-words text-sm text-red-600">
          {error.message}
        </p>
      )}

      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
      >
        Try again
      </button>
    </section>
  );
}
