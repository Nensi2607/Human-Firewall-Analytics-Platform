const SecurityActivityTimeline = ({ activities = [] }) => {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">Security Activity Timeline</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {activities.length === 0 ? (
          <p className="text-slate-500">No recent security activity to display.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity, index) => (
              <li key={`${activity.title ?? "activity"}-${index}`} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-slate-800">{activity.title || "Security activity"}</p>
                  <p className="text-sm text-slate-500">{activity.time || activity.date || "Recently"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default SecurityActivityTimeline;
