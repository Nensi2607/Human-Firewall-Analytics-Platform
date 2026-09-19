import { useEffect, useState } from "react";
import { ChevronDown, Rocket } from "lucide-react";
import {
  createCampaign,
  getCampaigns,
  getCampaignStats,
  launchCampaign,
} from "../services/adminCampaignService";
import { getDepartments, getEmployees } from "../services/adminDirectoryService";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const AdminPhishingCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [assignmentMode, setAssignmentMode] = useState("employees");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [form, setForm] = useState({ title: "", emailSubject: "", emailTemplate: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [launchingId, setLaunchingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCampaigns = async () => {
    setLoading(true);
    setError("");
    try {
      const [campaignRecords, employeeRecords, departmentRecords] = await Promise.all([
        getCampaigns(),
        getEmployees(),
        getDepartments(),
      ]);
      const recordsWithStats = await Promise.all(campaignRecords.map(async (campaign) => {
        const stats = await getCampaignStats(campaign._id);
        return { ...campaign, ...stats };
      }));
      setCampaigns(recordsWithStats);
      setEmployees(employeeRecords);
      setDepartments(departmentRecords);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load phishing campaign data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadCampaigns);
  }, []);

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((current) => current.includes(employeeId)
      ? current.filter((id) => id !== employeeId)
      : [...current, employeeId]);
  };

  const validate = () => {
    if (!form.title.trim()) return "Campaign name is required.";
    if (!form.emailSubject.trim()) return "Email subject is required.";
    if (!form.emailTemplate.trim()) return "Email body is required.";
    if (assignmentMode === "employees" && selectedEmployees.length === 0) return "Select at least one employee.";
    if (assignmentMode === "department" && !selectedDepartment) return "Select a department.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await createCampaign({
        title: form.title.trim(),
        emailSubject: form.emailSubject.trim(),
        emailTemplate: form.emailTemplate,
        targetUsers: assignmentMode === "employees" ? selectedEmployees : [],
        targetDepartments: assignmentMode === "department" ? [selectedDepartment] : [],
        targetAll: false,
      });
      setMessage(`Campaign "${response.data.title}" was created as a draft. No emails were sent; launch it below when ready.`);
      setForm({ title: "", emailSubject: "", emailTemplate: "" });
      setSelectedEmployees([]);
      setSelectedDepartment("");
      await loadCampaigns();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Campaign creation failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaunch = async (campaignId) => {
    setError("");
    setMessage("");
    setLaunchingId(campaignId);
    try {
      const response = await launchCampaign(campaignId);
      setMessage(`${response.message} ${response.data.sentCount} email(s) sent to ${response.data.targetedCount} target(s).`);
      await loadCampaigns();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Campaign launch failed."));
    } finally {
      setLaunchingId("");
    }
  };

  const handleDetails = async (campaign) => {
    setError("");
    try {
      setSelectedCampaign(await getCampaignStats(campaign._id));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load campaign breakdown."));
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Admin Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Phishing Campaigns</h1>
        <p className="mt-2 text-slate-600">Create, launch, and inspect employee-level simulation results.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-medium text-emerald-700">{message}</div>}

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="text-sm font-semibold text-slate-700">Campaign name</span>
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-700">Email subject</span>
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.emailSubject} onChange={(event) => setForm({ ...form, emailSubject: event.target.value })} required />
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Email body</span>
            <textarea className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" rows="7" placeholder="Use {{TRACKING_LINK}} where the simulation link should appear." value={form.emailTemplate} onChange={(event) => setForm({ ...form, emailTemplate: event.target.value })} required />
          </label>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <h2 className="text-xl font-bold text-slate-900">Targets</h2>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setAssignmentMode("employees")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${assignmentMode === "employees" ? "bg-red-600 text-white" : "border border-slate-300 text-slate-700"}`}>Specific employees</button>
            <button type="button" onClick={() => setAssignmentMode("department")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${assignmentMode === "department" ? "bg-red-600 text-white" : "border border-slate-300 text-slate-700"}`}>Department</button>
          </div>
          {assignmentMode === "department" ? (
            <select className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2" value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
              <option value="">Select a department</option>
              {departments.map((department) => <option key={department._id} value={department._id}>{department.departmentName}</option>)}
            </select>
          ) : (
            <div className="mt-4 grid max-h-48 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3 md:grid-cols-2">
              {employees.map((employee) => <label key={employee._id} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={selectedEmployees.includes(employee._id)} onChange={() => toggleEmployee(employee._id)} />{employee.firstName} {employee.lastName} ({employee.email})</label>)}
              {employees.length === 0 && <p className="text-sm text-slate-500">No employee records available.</p>}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="mt-6 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Creating campaign..." : "Create campaign"}</button>
      </form>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Campaign history</h2>
        {loading ? <p className="mt-4 text-slate-500">Loading campaigns and live stats...</p> : campaigns.length === 0 ? <p className="mt-4 text-slate-500">No campaigns have been created yet.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Subject</th><th className="px-3 py-3">Launched</th><th className="px-3 py-3">Targeted</th><th className="px-3 py-3">Clicked</th><th className="px-3 py-3">Click rate</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign._id} className="border-b border-slate-100"><td className="px-3 py-3"><div className="font-semibold text-slate-800">{campaign.emailSubject}</div><div className="text-xs text-slate-500">{campaign.title}</div></td><td className="px-3 py-3">{campaign.launchDate ? new Date(campaign.launchDate).toLocaleString() : "Not launched"}</td><td className="px-3 py-3">{campaign.targetedCount ?? 0}</td><td className="px-3 py-3">{campaign.clickedCount ?? 0}</td><td className="px-3 py-3">{campaign.clickRate ?? 0}%</td><td className="px-3 py-3 capitalize">{campaign.status}</td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" onClick={() => handleDetails(campaign)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"><ChevronDown size={14} /> Details</button>{campaign.status === "draft" && <button type="button" onClick={() => handleLaunch(campaign._id)} disabled={launchingId === campaign._id} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"><Rocket size={14} />{launchingId === campaign._id ? "Launching..." : "Launch"}</button>}</div></td></tr>)}</tbody></table></div>}
      </section>

      {selectedCampaign && <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{selectedCampaign.campaign.title}</h2><p className="text-sm text-slate-500">{selectedCampaign.targetedCount} targeted, {selectedCampaign.clickedCount} clicked, {selectedCampaign.clickRate}% click rate</p></div><button type="button" onClick={() => setSelectedCampaign(null)} className="text-sm font-semibold text-slate-500">Close</button></div><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Employee</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Clicked</th><th className="px-3 py-3">Clicked at</th></tr></thead><tbody>{selectedCampaign.employees.map((record) => <tr key={record.employee?._id || record.sentAt} className="border-b border-slate-100"><td className="px-3 py-3">{record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : "Unknown employee"}</td><td className="px-3 py-3">{record.employee?.email || "-"}</td><td className="px-3 py-3">{record.clicked ? "Yes" : "No"}</td><td className="px-3 py-3">{record.clickedAt ? new Date(record.clickedAt).toLocaleString() : "-"}</td></tr>)}</tbody></table></div></section>}
    </div>
  );
};

export default AdminPhishingCampaigns;
