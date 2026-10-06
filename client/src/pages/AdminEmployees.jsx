import { useEffect, useState } from "react";
import { getDepartments, getEmployees, updateEmployee } from "../services/adminDirectoryService";
import { getEmployeeProgress } from "../services/employeeProgressService";

const PAGE_SIZE = 12;

const getDepartmentId = (employee) =>
  employee.departmentId?._id || employee.departmentId || "";

const AdminEmployees = () => {
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
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Employees</h1>
        <p className="mt-2 text-slate-600">{employees.length} employee accounts</p>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

      {loading ? (
        <p role="status" className="py-8 text-slate-500">Loading employees...</p>
      ) : error && employees.length === 0 ? (
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">Retry</button>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_220px]">
            <label className="text-sm font-semibold text-slate-700">
              Search
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Name or email" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Status
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Department
              <select value={departmentFilter} onChange={(event) => { setDepartmentFilter(event.target.value); setPage(1); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal">
                <option value="all">All departments</option>
                <option value="">Unassigned</option>
                {departments.map((department) => <option key={department._id} value={department._id}>{department.departmentName}</option>)}
              </select>
            </label>
          </div>

          {filteredEmployees.length === 0 ? (
            <p className="py-8 text-slate-500">No employees match these filters.</p>
          ) : (
            <>
              <div className="overflow-x-auto border-y border-slate-200">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr><th className="px-3 py-3">Employee</th><th className="px-3 py-3">Department</th><th className="px-3 py-3">Designation</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Details</th></tr>
                  </thead>
                  <tbody>
                    {visibleEmployees.map((employee) => (
                      <tr key={employee._id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-3"><span className="block font-semibold text-slate-900">{employee.firstName} {employee.lastName}</span><span className="text-slate-500">{employee.email}</span></td>
                        <td className="px-3 py-3">{employee.departmentId?.departmentName || "Unassigned"}</td>
                        <td className="px-3 py-3">{employee.designation || "-"}</td>
                        <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${employee.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{employee.status}</span></td>
                        <td className="px-3 py-3"><button type="button" onClick={() => selectEmployee(employee)} className="font-semibold text-blue-700 hover:underline">View / edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>{filteredEmployees.length} results</span>
                <div className="flex items-center gap-3">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-40">Previous</button>
                  <span>Page {page} of {pageCount}</span>
                  <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-slate-300 px-3 py-2 disabled:opacity-40">Next</button>
                </div>
              </div>
            </>
          )}

          {selectedEmployee && form && (
            <div className="grid gap-8 border-t border-slate-200 pt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Employee details</h2>
                  <p className="mt-1 text-sm text-slate-500">Account created {new Date(selectedEmployee.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">First name<input required maxLength={80} value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                  <label className="text-sm font-semibold text-slate-700">Last name<input required maxLength={80} value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Email<input required type="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                  <label className="text-sm font-semibold text-slate-700">Designation<input maxLength={120} value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                  <label className="text-sm font-semibold text-slate-700">Department<select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="">Unassigned</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.departmentName}</option>)}</select></label>
                  <label className="text-sm font-semibold text-slate-700">Account status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                </div>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
              </form>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">Awareness progress</h2>
                {progressLoading ? <p className="mt-4 text-sm text-slate-500">Loading progress...</p> : progress ? (
                  <dl className="mt-4 divide-y divide-slate-200 text-sm">
                    <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">Training completion</dt><dd className="font-semibold text-slate-900">{progress.training?.completionPercentage == null ? "N/A" : `${progress.training.completionPercentage}%`}</dd></div>
                    <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">Training modules</dt><dd className="font-semibold text-slate-900">{progress.training?.completed ?? 0} / {progress.training?.total ?? 0}</dd></div>
                    <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">Quiz completion</dt><dd className="font-semibold text-slate-900">{progress.quizzes?.completionPercentage == null ? "N/A" : `${progress.quizzes.completionPercentage}%`}</dd></div>
                    <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">Assigned quizzes</dt><dd className="font-semibold text-slate-900">{progress.quizzes?.completed ?? 0} / {progress.quizzes?.total ?? 0}</dd></div>
                  </dl>
                ) : <p className="mt-4 text-sm text-slate-500">No progress data is available for this employee yet.</p>}
              </section>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default AdminEmployees;