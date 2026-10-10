export default function ProductDetailLoading() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-4 w-36 rounded bg-slate-200" />

        <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 p-8">
            <div className="h-6 w-40 rounded-full bg-slate-200" />
            <div className="mt-6 h-8 w-3/4 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-full rounded bg-slate-200" />
            <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
            <div className="mt-8 h-8 w-48 rounded bg-slate-200" />
          </div>

          <div className="h-fit rounded-2xl border border-slate-200 p-6">
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="mt-5 h-6 w-28 rounded-full bg-slate-200" />
            <div className="mt-4 h-4 w-40 rounded bg-slate-200" />
            <div className="mt-8 h-12 w-full rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
