import { useEffect, useMemo, useState } from "react";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  getEmployees,
  updateDepartment,
} from "../services/adminDirectoryService";
import { getDepartmentComparison } from "../services/analyticsApi";

const emptyForm = { departmentName: "", description: "", manager: "", status: "active" };

const getManagerId = (department) =>
  department.manager?._id || department.manager || "";

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    const loadDepartments = async () => {
      setLoading(true);
      setError("");
      try {
        const [departmentRecords, employeeRecords, riskRecords] = await Promise.all([
          getDepartments(),
          getEmployees(),
          getDepartmentComparison(),
        ]);
        if (isActive) {
          setDepartments(departmentRecords);
          setEmployees(employeeRecords);
          setComparison(riskRecords.data || []);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.response?.data?.message || "Unable to load department data.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadDepartments();
    return () => {
      isActive = false;
    };
  }, [retryCount]);

  const selectedDepartment = departments.find((department) => department._id === selectedId);
  const departmentMembers = useMemo(
    () => employees.filter((employee) => String(employee.departmentId?._id || employee.departmentId || "") === selectedId),
    [employees, selectedId]
  );

  const getMetrics = (department) => comparison.find(
    (record) => record.department === department.departmentName
  );

  const handleEdit = (department) => {
    setEditingId(department._id);
    setForm({
      departmentName: department.departmentName || "",
      description: department.description || "",
      manager: getManagerId(department),
      status: department.status || "active",
    });
    setError("");
    setMessage("");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const payload = {
      ...form,
      departmentName: form.departmentName.trim(),
      description: form.description.trim(),
      manager: form.manager || null,
    };

    try {
      if (editingId) {
        const updated = await updateDepartment(editingId, payload);
        setDepartments((current) => current.map((department) => (
          department._id === updated._id ? updated : department
        )));
        setMessage("Department updated.");
      } else {
        const created = await createDepartment(payload);
        setDepartments((current) => [...current, created]);
        setMessage("Department created.");
      }
      resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save department.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Delete ${department.departmentName}? This cannot be undone.`)) return;
    setDeletingId(department._id);
    setError("");
    setMessage("");
    try {
      await deleteDepartment(department._id);
      setDepartments((current) => current.filter((item) => item._id !== department._id));
      if (selectedId === department._id) setSelectedId("");
      if (editingId === department._id) resetForm();
      setMessage("Department deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete department.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="admin-quiz-page department-page-shell">
      <header className="admin-page-header department-page-header-block">
        <p className="section-kicker admin-page-kicker">Admin workspace</p>
        <h1 className="admin-page-title">Departments</h1>
        <p className="admin-page-subtitle">{departments.length} departments · {employees.length} employees</p>
      </header>

      {error && <p role="alert" className="admin-alert admin-alert-error">{error}</p>}
      {message && <p role="status" className="admin-alert admin-alert-success">{message}</p>}

      {loading ? <p role="status" className="empty-state">Loading departments...</p> : error && departments.length === 0 ? (
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="admin-secondary-button department-retry-button">Retry</button>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="admin-card department-form-card">
            <div className="admin-section-header department-header-row">
              <div>
                <h2>{editingId ? "Edit department" : "Create department"}</h2>
                <p>Departments with existing employee or campaign assignments cannot be deleted.</p>
              </div>
              {editingId && <button type="button" onClick={resetForm} className="admin-link-button">Cancel edit</button>}
            </div>
            <div className="admin-form-grid">
              <label className="admin-form-field">
                <span>Department name</span>
                <input required maxLength={120} value={form.departmentName} onChange={(event) => setForm({ ...form, departmentName: event.target.value })} />
              </label>
              <label className="admin-form-field">
                <span>Manager</span>
                <select value={form.manager} onChange={(event) => setForm({ ...form, manager: event.target.value })} className="admin-select-field">
                  <option value="">No manager</option>
                  {employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.firstName} {employee.lastName}</option>)}
                </select>
              </label>
              <label className="admin-form-field admin-form-field-full">
                <span>Description</span>
                <textarea maxLength={500} rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </label>
              {editingId && <label className="admin-form-field">
                <span>Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="admin-select-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>}
            </div>
            <button type="submit" disabled={saving} className="admin-primary-button department-submit-button">{saving ? "Saving..." : editingId ? "Save changes" : "Create department"}</button>
          </form>

          {departments.length === 0 ? <p className="empty-state">No departments have been created yet.</p> : (
            <div className="admin-card admin-table-card department-table-card">
              <div className="admin-section-header department-table-header">
                <h2>Department overview</h2>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-quiz-table department-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Employees</th>
                      <th>Average risk</th>
                      <th>Quiz</th>
                      <th>Training</th>
                      <th>Phishing</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{departments.map((department) => {
                    const metric = getMetrics(department);
                    const employeeCount = employees.filter((employee) => String(employee.departmentId?._id || employee.departmentId || "") === department._id).length;
                    const manager = department.manager;
                    return (
                      <tr key={department._id}>
                        <td>
                          <span className="department-name">{department.departmentName}</span>
                          <span className="department-manager">{manager ? `${manager.firstName} ${manager.lastName}` : "No manager"}</span>
                        </td>
                        <td>{employeeCount}</td>
                        <td>{metric?.averageRiskScore == null ? "No assessment data" : `${metric.averageRiskScore}%`}</td>
                        <td>{metric?.averageQuizScore == null ? "-" : `${metric.averageQuizScore}%`}</td>
                        <td>{metric?.averageTrainingScore == null ? "-" : `${metric.averageTrainingScore}%`}</td>
                        <td>{metric?.averagePhishingScore == null ? "-" : `${metric.averagePhishingScore}%`}</td>
                        <td className="department-status">{department.status}</td>
                        <td>
                          <div className="department-actions">
                            <button type="button" onClick={() => setSelectedId(selectedId === department._id ? "" : department._id)} className="department-link-button">Employees</button>
                            <button type="button" onClick={() => handleEdit(department)} className="department-link-button">Edit</button>
                            <button type="button" disabled={deletingId === department._id} onClick={() => handleDelete(department)} className="department-delete-button">{deletingId === department._id ? "Deleting..." : "Delete"}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            </div>
          )}

          {selectedDepartment && (
            <section className="admin-card department-detail-card">
              <h2 className="admin-section-title">{selectedDepartment.departmentName} employees</h2>
              {getMetrics(selectedDepartment) && (
                <p className="department-risk-summary">
                  Risk distribution: High {getMetrics(selectedDepartment).highRisk}, Medium {getMetrics(selectedDepartment).mediumRisk}, Low {getMetrics(selectedDepartment).lowRisk}.
                </p>
              )}
              {departmentMembers.length === 0 ? <p className="empty-state">No employees are assigned to this department.</p> : (
                <ul className="department-member-list">{departmentMembers.map((employee) => <li key={employee._id}><span>{employee.firstName} {employee.lastName}</span><span>{employee.email}</span></li>)}</ul>
              )}
            </section>
          )}
        </>
      )}
    </section>
  );
};

export default AdminDepartments;