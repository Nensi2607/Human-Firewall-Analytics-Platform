function EmployeeRiskTable({ employees = [] }) {
  if (employees.length === 0) {
    return (
      <div className="analytics-panel">
        <p className="analytics-empty">No employee risk data available.</p>
      </div>
    );
  }

  return (
    <div className="analytics-panel">
      <div className="analytics-table-wrap">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Risk Level</th>
              <th>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => {
              const name =
                employee.name ||
                employee.employeeName ||
                employee.fullName ||
                `Employee ${index + 1}`;
              const department =
                employee.department || employee.team || employee.role || "N/A";
              const riskLevel =
                employee.riskLevel || employee.level || employee.status || "Unknown";
              const score = employee.riskScore ?? employee.score ?? employee.averageRisk ?? 0;

              return (
                <tr key={`${name}-${department}-${index}`}>
                  <td>{name}</td>
                  <td>{department}</td>
                  <td>
                    <span className={`risk-pill risk-pill-${String(riskLevel).toLowerCase()}`}>
                      {riskLevel}
                    </span>
                  </td>
                  <td>{score}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeRiskTable;
