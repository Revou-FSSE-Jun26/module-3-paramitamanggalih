export default function HomeLoading() {
  return (
    <div>
      <section className="animate-pulse bg-blue-800 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-4 w-40 rounded bg-blue-400" />
          <div className="mt-5 h-12 max-w-xl rounded bg-blue-400" />
          <div className="mt-4 h-5 max-w-lg rounded bg-blue-400" />
          <div className="mt-7 h-12 w-44 rounded-xl bg-white/70" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-6">
              <div className="h-5 w-28 rounded bg-slate-200" />
              <div className="mt-5 h-6 w-3/4 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-full rounded bg-slate-200" />
              <div className="mt-6 h-10 w-full rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
