const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
        Dashboard Section
      </p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-4 max-w-2xl text-base text-slate-600">
        {description}
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
        This page is intentionally left as a placeholder for the next teammate to implement.
      </div>
    </div>
  );
};

export default PlaceholderPage;
