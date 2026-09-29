import { useEffect, useState } from "react";
import { getDepartments } from "../services/adminDirectoryService";
import { getLeaderboard } from "../services/leaderboardService";

const formatPercentage = (value) => `${Number(value || 0).toFixed(1)}%`;

const Leaderboard = () => {
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [scope, setScope] = useState("Company-wide");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      setError("");
      try {
        const [departmentRecords, response] = await Promise.all([
          getDepartments(),
          getLeaderboard(departmentId),
        ]);
        if (!isActive) return;
        setDepartments(departmentRecords);
        setRows(response.data || []);
        setScope(response.scope?.departmentName || "Company-wide");
      } catch {
        if (isActive) {
          setRows([]);
          setError("Unable to load the leaderboard.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [departmentId]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Security learning
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Leaderboard</h1>
          <p className="mt-2 text-slate-600">Ranked by quiz results and completed training.</p>
        </div>
        <label className="w-full max-w-xs">
          <span className="text-sm font-semibold text-slate-700">View</span>
          <select
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">Company-wide</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.departmentName}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="mb-6 border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
        <h2 className="text-sm font-bold text-amber-950">Placeholder ranking formula</h2>
        <p className="mt-1 text-sm text-amber-900">
          (average quiz percentage + training completion percentage) / 2. Pending a final team decision.
        </p>
      </section>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section aria-label={`${scope} leaderboard`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{scope}</h2>
          {!loading && <p className="text-sm text-slate-500">{rows.length} employees</p>}
        </div>
        {loading ? (
          <p className="py-8 text-slate-500">Loading leaderboard...</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-slate-500">No active employees in this view.</p>
        ) : (
          <div className="overflow-x-auto border-y border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-3 py-3">Rank</th>
                  <th scope="col" className="px-3 py-3">Employee</th>
                  <th scope="col" className="px-3 py-3">Department</th>
                  <th scope="col" className="px-3 py-3 text-right">Quiz average</th>
                  <th scope="col" className="px-3 py-3 text-right">Training</th>
                  <th scope="col" className="px-3 py-3 text-right">Placeholder score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.userId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-4 font-semibold text-slate-600">{row.rank}</td>
                    <th scope="row" className="px-3 py-4 font-semibold text-slate-900">{row.name}</th>
                    <td className="px-3 py-4 text-slate-600">{row.department}</td>
                    <td className="px-3 py-4 text-right tabular-nums text-slate-700">
                      {formatPercentage(row.averageQuizPercentage)}
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums text-slate-700">
                      {row.completedTrainings}/{row.totalTrainings} · {formatPercentage(row.trainingCompletionPercentage)}
                    </td>
                    <td className="px-3 py-4 text-right font-bold tabular-nums text-slate-900">
                      {formatPercentage(row.leaderboardScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Leaderboard;