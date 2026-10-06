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
    <section className="mx-auto max-w-7xl space-y-7">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Departments</h1>
        <p className="mt-2 text-slate-600">{departments.length} departments · {employees.length} employees</p>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

      {loading ? <p role="status" className="py-8 text-slate-500">Loading departments...</p> : error && departments.length === 0 ? (
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">Retry</button>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4 border-b border-slate-200 pb-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{editingId ? "Edit department" : "Create department"}</h2>
                <p className="mt-1 text-sm text-slate-500">Departments with existing employee or campaign assignments cannot be deleted.</p>
              </div>
              {editingId && <button type="button" onClick={resetForm} className="text-sm font-semibold text-slate-600 hover:text-slate-900">Cancel edit</button>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Department name<input required maxLength={120} value={form.departmentName} onChange={(event) => setForm({ ...form, departmentName: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Manager<select value={form.manager} onChange={(event) => setForm({ ...form, manager: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="">No manager</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.firstName} {employee.lastName}</option>)}</select></label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">Description<textarea maxLength={500} rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
              {editingId && <label className="text-sm font-semibold text-slate-700">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>}
            </div>
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save changes" : "Create department"}</button>
          </form>

          {departments.length === 0 ? <p className="py-8 text-slate-500">No departments have been created yet.</p> : (
            <div className="overflow-x-auto border-y border-slate-200">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Department</th><th className="px-3 py-3">Employees</th><th className="px-3 py-3">Average risk</th><th className="px-3 py-3">Quiz</th><th className="px-3 py-3">Training</th><th className="px-3 py-3">Phishing</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead>
                <tbody>{departments.map((department) => {
                  const metric = getMetrics(department);
                  const employeeCount = employees.filter((employee) => String(employee.departmentId?._id || employee.departmentId || "") === department._id).length;
                  const manager = department.manager;
                  return (
                    <tr key={department._id} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-3"><span className="block font-semibold text-slate-900">{department.departmentName}</span><span className="text-slate-500">{manager ? `${manager.firstName} ${manager.lastName}` : "No manager"}</span></td>
                      <td className="px-3 py-3">{employeeCount}</td>
                      <td className="px-3 py-3">{metric?.averageRiskScore == null ? "No assessment data" : `${metric.averageRiskScore}%`}</td>
                      <td className="px-3 py-3">{metric?.averageQuizScore == null ? "-" : `${metric.averageQuizScore}%`}</td>
                      <td className="px-3 py-3">{metric?.averageTrainingScore == null ? "-" : `${metric.averageTrainingScore}%`}</td>
                      <td className="px-3 py-3">{metric?.averagePhishingScore == null ? "-" : `${metric.averagePhishingScore}%`}</td>
                      <td className="px-3 py-3 capitalize">{department.status}</td>
                      <td className="px-3 py-3"><div className="flex gap-3"><button type="button" onClick={() => setSelectedId(selectedId === department._id ? "" : department._id)} className="font-semibold text-blue-700 hover:underline">Employees</button><button type="button" onClick={() => handleEdit(department)} className="font-semibold text-slate-700 hover:underline">Edit</button><button type="button" disabled={deletingId === department._id} onClick={() => handleDelete(department)} className="font-semibold text-red-700 hover:underline disabled:opacity-50">{deletingId === department._id ? "Deleting..." : "Delete"}</button></div></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}

          {selectedDepartment && (
            <section className="border-t border-slate-200 pt-5">
              <h2 className="text-lg font-semibold text-slate-900">{selectedDepartment.departmentName} employees</h2>
              {getMetrics(selectedDepartment) && (
                <p className="mt-2 text-sm text-slate-600">
                  Risk distribution: High {getMetrics(selectedDepartment).highRisk}, Medium {getMetrics(selectedDepartment).mediumRisk}, Low {getMetrics(selectedDepartment).lowRisk}.
                </p>
              )}
              {departmentMembers.length === 0 ? <p className="mt-3 text-sm text-slate-500">No employees are assigned to this department.</p> : (
                <ul className="mt-3 divide-y divide-slate-200">{departmentMembers.map((employee) => <li key={employee._id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="font-medium text-slate-800">{employee.firstName} {employee.lastName}</span><span className="text-slate-500">{employee.email}</span></li>)}</ul>
              )}
            </section>
          )}
        </>
      )}
    </section>
  );
};

export default AdminDepartments;