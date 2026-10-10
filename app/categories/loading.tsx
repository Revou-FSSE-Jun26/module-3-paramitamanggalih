export default function CategoriesLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-8 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="animate-pulse rounded-2xl border p-6">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-32 rounded bg-slate-200" />
            <div className="mt-6 h-10 w-36 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
