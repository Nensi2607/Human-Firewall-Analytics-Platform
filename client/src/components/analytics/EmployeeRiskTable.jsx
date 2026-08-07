import { useMemo, useState } from "react";

function EmployeeRiskTable({ employees = [] }) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] =
    useState("All");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const name =
        employee.name ||
        employee.employeeName ||
        "";

      const department =
        employee.department || "";

      const riskLevel =
        employee.riskLevel || "Unknown";

      const searchText =
        search.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchText) ||
        department.toLowerCase().includes(searchText);

      const matchesRisk =
        riskFilter === "All" ||
        riskLevel.toLowerCase() ===
          riskFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesRisk
      );
    });
  }, [employees, search, riskFilter]);

  const getRiskClass = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "risk-high";

      case "medium":
        return "risk-medium";

      case "low":
        return "risk-low";

      default:
        return "risk-unknown";
    }
  };

  return (
    <div className="analytics-table-card">
      <div className="analytics-table-header">
        <div>
          <h3>Employee Risk Analytics</h3>

          <p>
            Employee-level cybersecurity risk
            overview
          </p>
        </div>

        <div className="analytics-table-filters">
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(event.target.value)
            }
          >
            <option value="All">
              All Risks
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>
          </select>
        </div>
      </div>

      <div className="analytics-table-wrapper">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Last Assessment</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(
                (employee, index) => {
                  const name =
                    employee.name ||
                    employee.employeeName ||
                    "Unknown";

                  const department =
                    employee.department ||
                    "N/A";

                  const score =
                    employee.riskScore ??
                    employee.score ??
                    0;

                  const riskLevel =
                    employee.riskLevel ||
                    "Unknown";

                  return (
                    <tr
                      key={
                        employee._id ||
                        employee.id ||
                        index
                      }
                    >
                      <td>{name}</td>

                      <td>
                        {department}
                      </td>

                      <td>{score}</td>

                      <td>
                        <span
                          className={`risk-badge ${getRiskClass(
                            riskLevel
                          )}`}
                        >
                          {riskLevel}
                        </span>
                      </td>

                      <td>
                        {employee.lastAssessment
                          ? new Date(
                              employee.lastAssessment
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="analytics-empty"
                >
                  No employee analytics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeRiskTable;