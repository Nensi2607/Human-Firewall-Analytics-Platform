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
    <div className="admin-quiz-page leaderboard-page">
      <header className="admin-page-header leaderboard-header">
        <div>
          <p className="section-kicker">Security learning</p>
          <h1 className="leaderboard-title">Leaderboard</h1>
          <p className="admin-page-subtitle leaderboard-subtitle">Ranked by quiz results and completed training.</p>
        </div>
        <label className="leaderboard-filter">
          <span>View</span>
          <select
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            className="leaderboard-select"
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

      <section className="leaderboard-summary admin-card">
        <h2>Prototype learning score</h2>
        <p>
          This score averages quiz results and training completion. It ranks learning activity only and is not a human risk score.
        </p>
      </section>

      {error && <p role="alert" className="admin-alert admin-alert-error">{error}</p>}

      <section className="admin-card leaderboard-table-card" aria-label={`${scope} leaderboard`}>
        <div className="admin-section-header leaderboard-table-header">
          <h2>{scope}</h2>
          {!loading && <p>{rows.length} employees</p>}
        </div>
        {loading ? (
          <p className="empty-state">Loading leaderboard...</p>
        ) : rows.length === 0 ? (
          <p className="empty-state">No active employees in this view.</p>
        ) : (
          <div className="admin-table-wrap leaderboard-table-wrap">
            <table className="admin-quiz-table leaderboard-table">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Employee</th>
                  <th scope="col">Department</th>
                  <th scope="col" className="leaderboard-numeric">Quiz average</th>
                  <th scope="col" className="leaderboard-numeric">Training</th>
                  <th scope="col" className="leaderboard-numeric">Learning score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.userId}>
                    <td className="leaderboard-rank">{row.rank}</td>
                    <th scope="row" className="admin-quiz-title-cell leaderboard-name">{row.name}</th>
                    <td>{row.department}</td>
                    <td className="leaderboard-numeric leaderboard-metric">
                      {formatPercentage(row.averageQuizPercentage)}
                    </td>
                    <td className="leaderboard-numeric leaderboard-metric">
                      {row.completedTrainings}/{row.totalTrainings} · {formatPercentage(row.trainingCompletionPercentage)}
                    </td>
                    <td className="leaderboard-numeric leaderboard-score">
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