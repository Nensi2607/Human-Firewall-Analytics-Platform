import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const targetEmployeeId = searchParams.get("employeeId");
  const targetDepartmentId = searchParams.get("departmentId");
  const [campaigns, setCampaigns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [assignmentMode, setAssignmentMode] = useState(() => targetDepartmentId ? "department" : "employees");
  const [selectedEmployees, setSelectedEmployees] = useState(() => targetEmployeeId ? [targetEmployeeId] : []);
  const [selectedDepartment, setSelectedDepartment] = useState(() => targetDepartmentId || "");
  const [form, setForm] = useState({ title: "", emailSubject: "", emailTemplate: "", senderName: "IT Support" });
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
    if (!form.senderName.trim() || /[@<>\r\n]/.test(form.senderName) || form.senderName.includes("\0")) return "Enter a valid sender display name without an email address.";
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
        senderName: form.senderName.trim(),
        targetUsers: assignmentMode === "employees" ? selectedEmployees : [],
        targetDepartments: assignmentMode === "department" ? [selectedDepartment] : [],
        targetAll: false,
      });
      setMessage(`Campaign "${response.data.title}" was created as a draft. No emails were sent; launch it below when ready.`);
      setForm({ title: "", emailSubject: "", emailTemplate: "", senderName: "IT Support" });
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
      setMessage(response.data.previewMode
        ? response.message
        : `${response.message} ${response.data.sentCount} email(s) sent to ${response.data.targetedCount} target(s).`);
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
    <div className="admin-phishing-page">
      <header className="admin-page-header">
        <p className="section-kicker admin-page-kicker">Admin Workspace</p>
        <h1 className="admin-page-title">Phishing Campaigns</h1>
        <p className="admin-page-subtitle">Create, launch, and inspect employee-level simulation results.</p>
      </header>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {message && <div className="admin-alert admin-alert-success">{message}</div>}

      <form onSubmit={handleSubmit} className="admin-card admin-phishing-form-card">
        <div className="admin-form-grid">
          <label className="admin-form-field">
            <span>Campaign name</span>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>
          <label className="admin-form-field">
            <span>Email subject</span>
            <input value={form.emailSubject} onChange={(event) => setForm({ ...form, emailSubject: event.target.value })} required />
          </label>
          <label className="admin-form-field admin-form-field-full">
            <span>Sender display name</span>
            <select className="admin-select-field" value={form.senderName} onChange={(event) => setForm({ ...form, senderName: event.target.value })}>
              <option value="IT Support">IT Support</option>
              <option value="HR Department">HR Department</option>
              <option value="Security Team">Security Team</option>
              <option value="">Custom...</option>
            </select>
            <input className="mt-2" value={form.senderName} onChange={(event) => setForm({ ...form, senderName: event.target.value })} placeholder="Type your own sender name" />
          </label>
          <label className="admin-form-field admin-form-field-full">
            <span>Email body</span>
            <textarea rows="7" placeholder="Use {{TRACKING_LINK}} where the simulation link should appear." value={form.emailTemplate} onChange={(event) => setForm({ ...form, emailTemplate: event.target.value })} required />
          </label>
        </div>

        <div className="admin-panel-divider">
          <h2 className="admin-section-title">Targets</h2>
          <div className="admin-assignment-toggle-group">
            <button type="button" onClick={() => setAssignmentMode("employees")} className={`admin-assignment-toggle ${assignmentMode === "employees" ? "active" : ""}`}>Specific employees</button>
            <button type="button" onClick={() => setAssignmentMode("department")} className={`admin-assignment-toggle ${assignmentMode === "department" ? "active" : ""}`}>Department</button>
          </div>
          {assignmentMode === "department" ? (
            <select className="admin-select-field" value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
              <option value="">Select a department</option>
              {departments.map((department) => <option key={department._id} value={department._id}>{department.departmentName}</option>)}
            </select>
          ) : (
            <div className="admin-assignment-list">
              {employees.map((employee) => <label key={employee._id} className="admin-assignment-item"><input type="checkbox" checked={selectedEmployees.includes(employee._id)} onChange={() => toggleEmployee(employee._id)} />{employee.firstName} {employee.lastName} ({employee.email})</label>)}
              {employees.length === 0 && <p className="admin-empty-text">No employee records available.</p>}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="admin-primary-button">{submitting ? "Creating campaign..." : "Create campaign"}</button>
      </form>

      <section className="admin-card admin-phishing-history-card">
        <h2 className="admin-section-title">Campaign history</h2>
        {loading ? <p className="mt-4 text-slate-500">Loading campaigns and results...</p> : campaigns.length === 0 ? <p className="mt-4 text-slate-500">No campaigns have been created yet.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Campaign</th><th className="px-3 py-3">Launched</th><th className="px-3 py-3">Sent</th><th className="px-3 py-3">Clicked</th><th className="px-3 py-3">Reported</th><th className="px-3 py-3">No response</th><th className="px-3 py-3">Click rate</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign._id} className="border-b border-slate-100"><td className="px-3 py-3"><div className="font-semibold text-slate-800">{campaign.emailSubject}</div><div className="text-xs text-slate-500">{campaign.title}</div></td><td className="px-3 py-3">{campaign.launchDate ? new Date(campaign.launchDate).toLocaleString() : "Not launched"}</td><td className="px-3 py-3">{campaign.targetedCount ?? 0}</td><td className="px-3 py-3">{campaign.clickedCount ?? 0}</td><td className="px-3 py-3">{campaign.reportedCount ?? 0}</td><td className="px-3 py-3">{campaign.ignoredCount ?? 0}</td><td className="px-3 py-3">{campaign.clickRate ?? 0}%</td><td className="px-3 py-3 capitalize">{campaign.status}</td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" onClick={() => handleDetails(campaign)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"><ChevronDown size={14} /> Details</button>{campaign.status === "draft" && <button type="button" onClick={() => handleLaunch(campaign._id)} disabled={launchingId === campaign._id} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"><Rocket size={14} />{launchingId === campaign._id ? "Launching..." : "Launch"}</button>}</div></td></tr>)}</tbody></table></div>}
      </section>

      {selectedCampaign && <section className="admin-card admin-detail-card"><div className="admin-detail-header"><div><h2>{selectedCampaign.campaign.title}</h2><p>{selectedCampaign.targetedCount} targeted, {selectedCampaign.clickedCount} clicked, {selectedCampaign.clickRate}% click rate</p></div><button type="button" onClick={() => setSelectedCampaign(null)} className="admin-close-button">Close</button></div><div className="admin-table-wrap"><table className="admin-detail-table"><thead><tr><th>Employee</th><th>Email</th><th>Clicked</th><th>Clicked at</th></tr></thead><tbody>{selectedCampaign.employees.map((record) => <tr key={record.employee?._id || record.sentAt}><td>{record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : "Unknown employee"}</td><td>{record.employee?.email || "-"}</td><td>{record.clicked ? "Yes" : "No"}</td><td>{record.clickedAt ? new Date(record.clickedAt).toLocaleString() : "-"}</td></tr>)}</tbody></table></div></section>}
      {selectedCampaign && <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{selectedCampaign.campaign.title}</h2><p className="text-sm text-slate-500">{selectedCampaign.targetedCount} sent, {selectedCampaign.clickedCount} clicked, {selectedCampaign.reportedCount} reported, {selectedCampaign.ignoredCount} expired without response</p></div><button type="button" onClick={() => setSelectedCampaign(null)} className="text-sm font-semibold text-slate-500">Close</button></div><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Employee</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Clicked</th><th className="px-3 py-3">Reported</th><th className="px-3 py-3">Clicked at</th><th className="px-3 py-3">Reported at</th></tr></thead><tbody>{selectedCampaign.employees.map((record) => <tr key={record.employee?._id || record.sentAt} className="border-b border-slate-100"><td className="px-3 py-3">{record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : "Unknown employee"}</td><td className="px-3 py-3">{record.employee?.email || "-"}</td><td className="px-3 py-3">{record.clicked ? "Yes" : "No"}</td><td className="px-3 py-3">{record.reported ? "Yes" : "No"}</td><td className="px-3 py-3">{record.clickedAt ? new Date(record.clickedAt).toLocaleString() : "-"}</td><td className="px-3 py-3">{record.reportedAt ? new Date(record.reportedAt).toLocaleString() : "-"}</td></tr>)}</tbody></table></div></section>}
    </div>
  );
};

export default AdminPhishingCampaigns;
