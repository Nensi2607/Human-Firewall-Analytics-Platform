const activityStyles = {
  training: {
    marker: "bg-emerald-500",
    label: "Training",
  },
  quiz: {
    marker: "bg-amber-500",
    label: "Quiz",
  },
  phishing: {
    marker: "bg-orange-500",
    label: "Phishing Awareness",
  },
};

const formatActivityDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const SecurityActivityTimeline = ({ activities = [] }) => {
  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">
        Recent Security Activity
      </h2>

      {activities.length === 0 ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <p className="text-slate-600">No recent security activity yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Complete a training, quiz, or phishing awareness challenge to see
            activity here.
          </p>
        </div>
      ) : (
        <ol className="mt-5 space-y-4">
          {activities.map((activity, index) => {
            const style = activityStyles[activity.type] || {
              marker: "bg-slate-400",
              label: "Security Activity",
            };

            return (
              <li
                key={`${activity.type}-${activity.completedAt}-${index}`}
                className="relative flex gap-4"
              >
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${style.marker}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {style.label}
                      </p>
                    </div>
                    <time className="shrink-0 text-sm text-slate-500">
                      {formatActivityDate(activity.completedAt)}
                    </time>
                  </div>

                  {activity.type === "training" ? (
                    <p className="mt-2 text-sm text-emerald-600">
                      {activity.status}
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span>Score: {activity.score}%</span>
                      <span>{activity.detail}</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default SecurityActivityTimeline;