export default function ProductsLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-8 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-slate-200 p-5"
          >
            <div className="h-5 w-24 rounded bg-slate-200" />
            <div className="mt-5 h-6 w-3/4 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full rounded bg-slate-200" />
            <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
            <div className="mt-6 h-10 w-full rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
