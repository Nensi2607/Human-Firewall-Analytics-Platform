import { useEffect, useState } from "react";
import { getEmployees } from "../services/adminDirectoryService";
import { getEmployeeProgress } from "../services/employeeProgressService";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const ProgressMetric = ({ title, completed, total, percentage, detail }) => (
  <section className="border-b border-slate-200 py-6 last:border-b-0">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{detail}</p>
      </div>
      <p className="text-sm font-semibold text-slate-700">
        {completed} of {total} completed
      </p>
    </div>
    <div
      className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      aria-label={title}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={percentage ?? 0}
    >
      <div
        className="h-full rounded-full bg-emerald-600 transition-[width]"
        style={{ width: `${percentage ?? 0}%` }}
      />
    </div>
    <p className="mt-2 text-right text-sm font-semibold text-emerald-700">
      {percentage === null ? "No activities" : `${percentage}%`}
    </p>
  </section>
);

const EmployeeProgress = () => {
  const isAdmin = getStoredUser()?.role === "admin";
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [progress, setProgress] = useState(null);
  const [directoryLoading, setDirectoryLoading] = useState(isAdmin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return undefined;
    let isActive = true;

    void Promise.resolve().then(async () => {
      try {
        const records = await getEmployees();
        if (!isActive) return;
        setEmployees(records);
        setSelectedEmployeeId(records[0]?._id || "");
      } catch {
        if (isActive) setError("Unable to load employees.");
      } finally {
        if (isActive) setDirectoryLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && !selectedEmployeeId) return undefined;
    let isActive = true;

    void Promise.resolve().then(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getEmployeeProgress(
          isAdmin ? selectedEmployeeId : undefined
        );
        if (isActive) setProgress(response.data);
      } catch (requestError) {
        if (isActive) {
          setProgress(null);
          setError(
            requestError.response?.data?.message ||
              "Unable to load employee progress."
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [isAdmin, selectedEmployeeId]);

  const training = progress?.training;
  const quizzes = progress?.quizzes;
  const employeeName = progress?.employee
    ? `${progress.employee.firstName} ${progress.employee.lastName}`
    : "";

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-7 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Learning activity
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          {isAdmin ? "Employee Progress" : "My Progress"}
        </h1>
        <p className="mt-2 text-slate-600">
          Training and quiz completion from recorded activity.
        </p>
        {isAdmin && (
          <label className="mt-5 block max-w-md">
            <span className="text-sm font-semibold text-slate-700">Employee</span>
            <select
              value={selectedEmployeeId}
              onChange={(event) => setSelectedEmployeeId(event.target.value)}
              disabled={directoryLoading || employees.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              {employees.length === 0 ? (
                <option value="">No employees available</option>
              ) : employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName} ({employee.email})
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      {error && (
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading || directoryLoading ? (
        <p className="py-8 text-slate-500">Loading progress...</p>
      ) : progress ? (
        <>
          <section className="mb-5 border-b border-slate-200 pb-6">
            <p className="text-sm text-slate-500">Progress for</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{employeeName}</h2>
          </section>

          <section className="mb-7 border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Overall engagement
            </p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {progress.overallEngagementPercentage === null
                ? "N/A"
                : `${progress.overallEngagementPercentage}%`}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Combined completion across available training and assigned quizzes.
            </p>
          </section>

          <ProgressMetric
            title="Training completion"
            completed={training.completed}
            total={training.total}
            percentage={training.completionPercentage}
            detail="Average recorded progress across available training modules."
          />
          <ProgressMetric
            title="Quiz completion"
            completed={quizzes.completed}
            total={quizzes.total}
            percentage={quizzes.completionPercentage}
            detail="Assigned quizzes with at least one recorded result."
          />
        </>
      ) : !error && !directoryLoading && isAdmin ? (
        <p className="py-8 text-slate-500">Select an employee to view progress.</p>
      ) : null}
    </div>
  );
};

export default EmployeeProgress;