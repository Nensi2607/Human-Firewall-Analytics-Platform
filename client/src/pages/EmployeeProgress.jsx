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
  <section className="progress-metric-panel">
    <div className="progress-metric-header">
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      <p className="progress-metric-summary">
        {completed} of {total} completed
      </p>
    </div>
    <div
      className="progress-metric-track"
      role="progressbar"
      aria-label={title}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={percentage ?? 0}
    >
      <div
        className="progress-metric-fill"
        style={{ width: `${percentage ?? 0}%` }}
      />
    </div>
    <p className="progress-metric-value">
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
    <div className="employee-progress-shell">
      <header className="employee-progress-header">
        <p className="section-kicker">Learning activity</p>
        <p className="employee-progress-subhead">
          Training and quiz completion from recorded activity.
        </p>
        {isAdmin && (
          <label className="employee-progress-select-wrap">
            <span>Employee</span>
            <select
              value={selectedEmployeeId}
              onChange={(event) => setSelectedEmployeeId(event.target.value)}
              disabled={directoryLoading || employees.length === 0}
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
        <p role="alert" className="employee-progress-alert">
          {error}
        </p>
      )}

      {loading || directoryLoading ? (
        <p className="employee-progress-loading">Loading progress...</p>
      ) : progress ? (
        <>
          <section className="employee-progress-summary">
            <p className="employee-progress-summary-label">Progress for</p>
            <h2>{employeeName}</h2>
          </section>

          <section className="employee-progress-overview">
            <p className="employee-progress-overview-label">Overall engagement</p>
            <p className="employee-progress-overview-value">
              {progress.overallEngagementPercentage === null
                ? "N/A"
                : `${progress.overallEngagementPercentage}%`}
            </p>
            <p className="employee-progress-overview-copy">
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
        <p className="employee-progress-loading">Select an employee to view progress.</p>
      ) : null}
    </div>
  );
};

export default EmployeeProgress;