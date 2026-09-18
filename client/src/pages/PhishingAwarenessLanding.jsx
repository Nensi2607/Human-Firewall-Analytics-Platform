const PhishingAwarenessLanding = () => {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          HFAP Security Awareness
        </p>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          You clicked a simulated phishing email
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          This was a safe internal simulation. Before opening a link, check the
          sender, inspect the destination, and be cautious with urgent requests
          for passwords or sensitive information.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Pause", "Urgency is a common pressure tactic."],
            ["Inspect", "Check the real link destination."],
            ["Verify", "Use a known channel for confirmation."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-xl bg-slate-800 p-4">
              <h2 className="font-semibold text-cyan-200">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default PhishingAwarenessLanding;
