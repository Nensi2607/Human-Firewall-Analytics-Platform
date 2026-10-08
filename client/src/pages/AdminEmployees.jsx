import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartments, getEmployees, updateEmployee } from "../services/adminDirectoryService";
import { getEmployeeProgress } from "../services/employeeProgressService";

const PAGE_SIZE = 12;

const getDepartmentId = (employee) =>
  employee.departmentId?._id || employee.departmentId || "";

const AdminEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [form, setForm] = useState(null);
  const [progress, setProgress] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadDirectory = async () => {
      setLoading(true);
      setError("");
      try {
        const [employeeRecords, departmentRecords] = await Promise.all([
          getEmployees(),
          getDepartments(),
        ]);
        if (isActive) {
          setEmployees(employeeRecords);
          setDepartments(departmentRecords);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.response?.data?.message || "Unable to load employees.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadDirectory();
    return () => {
      isActive = false;
    };
  }, [retryCount]);

  useEffect(() => {
    if (!selectedEmployeeId) {
      return undefined;
    }

    let isActive = true;
    void getEmployeeProgress(selectedEmployeeId)
      .then((response) => {
        if (isActive) setProgress(response.data);
      })
      .catch(() => {
        if (isActive) setProgress(null);
      })
      .finally(() => {
        if (isActive) setProgressLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedEmployeeId]);

  const filteredEmployees = employees.filter((employee) => {
    const text = `${employee.firstName} ${employee.lastName} ${employee.email}`.toLowerCase();
    return (
      (!search || text.includes(search.trim().toLowerCase())) &&
      (statusFilter === "all" || employee.status === statusFilter) &&
      (departmentFilter === "all" || getDepartmentId(employee) === departmentFilter)
    );
  });
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const visibleEmployees = filteredEmployees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedEmployee = employees.find((employee) => employee._id === selectedEmployeeId);

  const selectEmployee = (employee) => {
    setSelectedEmployeeId(employee._id);
    setProgress(null);
    setProgressLoading(true);
    setForm({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      designation: employee.designation || "",
      departmentId: getDepartmentId(employee),
      status: employee.status || "active",
    });
    setMessage("");
    setError("");
  };

  const openEmployeeDetail = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedEmployee || !form) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateEmployee(selectedEmployee._id, {
        ...form,
        email: form.email.trim().toLowerCase(),
        departmentId: form.departmentId || null,
      });
      setEmployees((current) => current.map((employee) => (
        employee._id === updated._id ? updated : employee
      )));
      setForm({
        ...form,
        email: updated.email,
        departmentId: getDepartmentId(updated),
      });
      setMessage("Employee details updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update employee details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-quiz-page employee-page-shell">
      <header className="admin-page-header">
        <p className="section-kicker admin-page-kicker">Admin workspace</p>
        <h1 className="admin-page-title">Employees</h1>
        <p className="admin-page-subtitle">{employees.length} employee accounts</p>
      </header>

      {error && <p role="alert" className="admin-alert admin-alert-error">{error}</p>}
      {message && <p role="status" className="admin-alert admin-alert-success">{message}</p>}

      {loading ? (
        <p role="status" className="empty-state">Loading employees...</p>
      ) : error && employees.length === 0 ? (
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="admin-secondary-button employee-retry-button">Retry</button>
      ) : (
        <>
          <div className="employee-filter-grid">
            <label className="admin-form-field">
              <span>Search</span>
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Name or email" />
            </label>
            <label className="admin-form-field">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="admin-select-field">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="admin-form-field">
              <span>Department</span>
              <select value={departmentFilter} onChange={(event) => { setDepartmentFilter(event.target.value); setPage(1); }} className="admin-select-field">
                <option value="all">All departments</option>
                <option value="">Unassigned</option>
                {departments.map((department) => <option key={department._id} value={department._id}>{department.departmentName}</option>)}
              </select>
            </label>
          </div>

          {filteredEmployees.length === 0 ? (
            <p className="empty-state">No employees match these filters.</p>
          ) : (
            <>
              <div className="admin-card admin-table-card employee-table-card">
                <div className="admin-table-wrap">
                  <table className="admin-quiz-table employee-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Status</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEmployees.map((employee) => (
                        <tr key={employee._id}>
                          <td>
                            <span className="table-primary-text">{employee.firstName} {employee.lastName}</span>
                            <span className="table-secondary-text">{employee.email}</span>
                          </td>
                          <td>{employee.departmentId?.departmentName || "Unassigned"}</td>
                          <td>{employee.designation || "-"}</td>
                          <td><span className={`employee-status ${employee.status === "active" ? "employee-status-active" : "employee-status-inactive"}`}>{employee.status}</span></td>
                          <td><button type="button" onClick={() => openEmployeeDetail(employee._id)} className="table-link-button">View / edit</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="employee-pagination">
                <span>{filteredEmployees.length} results</span>
                <div className="employee-pagination-actions">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="admin-secondary-button">Previous</button>
                  <span>Page {page} of {pageCount}</span>
                  <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} className="admin-secondary-button">Next</button>
                </div>
              </div>
            </>
          )}

          {selectedEmployee && form && (
            <div className="employee-detail-panel">
              <form onSubmit={handleSave} className="admin-card employee-form-card">
                <div className="employee-form-header">
                  <h2>Employee details</h2>
                  <p>Account created {new Date(selectedEmployee.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="admin-form-grid">
                  <label className="admin-form-field">
                    <span>First name</span>
                    <input required maxLength={80} value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
                  </label>
                  <label className="admin-form-field">
                    <span>Last name</span>
                    <input required maxLength={80} value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
                  </label>
                  <label className="admin-form-field admin-form-field-full">
                    <span>Email</span>
                    <input required type="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                  </label>
                  <label className="admin-form-field">
                    <span>Designation</span>
                    <input maxLength={120} value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} />
                  </label>
                  <label className="admin-form-field">
                    <span>Department</span>
                    <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })} className="admin-select-field">
                      <option value="">Unassigned</option>
                      {departments.map((department) => <option key={department._id} value={department._id}>{department.departmentName}</option>)}
                    </select>
                  </label>
                  <label className="admin-form-field">
                    <span>Account status</span>
                    <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="admin-select-field">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>
                <button type="submit" disabled={saving} className="admin-primary-button employee-save-button">{saving ? "Saving..." : "Save changes"}</button>
              </form>

              <section className="admin-card employee-progress-card">
                <h2 className="admin-section-title">Awareness progress</h2>
                {progressLoading ? <p className="empty-state">Loading progress...</p> : progress ? (
                  <dl className="employee-progress-list">
                    <div><dt>Training completion</dt><dd>{progress.training?.completionPercentage == null ? "N/A" : `${progress.training.completionPercentage}%`}</dd></div>
                    <div><dt>Training modules</dt><dd>{progress.training?.completed ?? 0} / {progress.training?.total ?? 0}</dd></div>
                    <div><dt>Quiz completion</dt><dd>{progress.quizzes?.completionPercentage == null ? "N/A" : `${progress.quizzes.completionPercentage}%`}</dd></div>
                    <div><dt>Assigned quizzes</dt><dd>{progress.quizzes?.completed ?? 0} / {progress.quizzes?.total ?? 0}</dd></div>
                  </dl>
                ) : <p className="empty-state">No progress data is available for this employee yet.</p>}
              </section>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default AdminEmployees;