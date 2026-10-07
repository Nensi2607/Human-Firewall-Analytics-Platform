import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Activity, AlertTriangle, BookOpen, BrainCircuit, Building2, CalendarDays, ClipboardCheck, Mail, ShieldCheck, Trophy } from "lucide-react";
import { getEmployeeDetail, updateEmployee } from "../services/adminDirectoryService";

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
};

const formatPercent = (value) => (value == null ? "N/A" : `${value}%`);

const EmployeeDetail = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ departmentId: "", designation: "", status: "active" });

  const loadEmployee = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getEmployeeDetail(employeeId);
      setDetail(response.data);
      setForm({
        departmentId: response.data.employee.departmentId?._id || "",
        designation: response.data.employee.designation || "",
        status: response.data.employee.status || "active",
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load employee details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployee();
  }, [employeeId]);

  const departmentName = detail?.employee.departmentId?.departmentName || "Unassigned";
  const riskTone = detail?.risk?.riskLevel === "High" ? "text-red-700 bg-red-50" : detail?.risk?.riskLevel === "Medium" ? "text-amber-700 bg-amber-50" : detail?.risk?.riskLevel === "Low" ? "text-emerald-700 bg-emerald-50" : "text-slate-600 bg-slate-100";
  const stats = useMemo(() => [
    { label: "Training", value: `${detail?.training.completed ?? 0}/${detail?.training.total ?? 0}`, icon: BookOpen },
    { label: "Quiz results", value: `${detail?.quiz.completed ?? 0}/${detail?.quiz.total ?? 0}`, icon: ClipboardCheck },
    { label: "Phishing sent", value: detail?.phishing.summary.sent ?? 0, icon: ShieldCheck },
    { label: "Risk score", value: detail?.risk?.finalRiskScore ?? "N/A", icon: AlertTriangle },
  ], [detail]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateEmployee(employeeId, {
        departmentId: form.departmentId || null,
        designation: form.designation,
        status: form.status,
      });
      setDetail((current) => ({
        ...current,
        employee: { ...current.employee, ...updated },
      }));
      setMessage("Employee details updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update employee details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="mx-auto max-w-6xl py-8"><p className="text-slate-500">Loading employee details...</p></section>;
  if (error && !detail) return <section className="mx-auto max-w-6xl py-8"><p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p><button type="button" onClick={() => navigate("/employees")} className="mt-4 font-semibold text-blue-700">Return to employees</button></section>;

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <button type="button" onClick={() => navigate("/employees")} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><ArrowLeft size={16} /> Back to employees</button>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Employee profile</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{detail.employee.firstName} {detail.employee.lastName}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600"><span className="inline-flex items-center gap-1"><Mail size={15} /> {detail.employee.email}</span><span className="inline-flex items-center gap-1"><Building2 size={15} /> {departmentName}</span><span className="inline-flex items-center gap-1"><CalendarDays size={15} /> Joined {formatDate(detail.employee.createdAt)}</span></p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${detail.employee.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{detail.employee.status}</span>
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon size={18} className="text-blue-700" /></div><p className="mt-4 text-2xl font-bold text-slate-900">{value}</p></article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Performance overview</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <MetricCard icon={BookOpen} label="Training completion" value={formatPercent(detail.training.completionPercentage)} detail={`${detail.training.completed} completed of ${detail.training.total}`} />
            <MetricCard icon={ClipboardCheck} label="Quiz completion" value={formatPercent(detail.quiz.avgScore)} detail={`${detail.quiz.completed} assigned quiz${detail.quiz.total === 1 ? "" : "zes"} with results`} />
            <MetricCard icon={ShieldCheck} label="Phishing awareness" value={formatPercent(detail.phishingAwareness?.score)} detail={detail.phishingAwareness ? `${detail.phishingAwareness.correctAnswers}/${detail.phishingAwareness.totalScenarios} correct` : "No awareness result"} />
            <MetricCard icon={Trophy} label="Latest quiz" value={detail.quiz.latest ? formatPercent(detail.quiz.latest.percentage) : "N/A"} detail={detail.quiz.latest ? `${detail.quiz.latest.correctAnswers}/${detail.quiz.latest.totalQuestions} correct` : "No quiz record"} />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm text-slate-500">Human Risk Score</p><h2 className="text-xl font-semibold text-slate-900">{detail.risk?.finalRiskScore ?? "Not available"}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${riskTone}`}>{detail.risk?.riskLevel || "Not assessed"}</span></div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Training score</dt><dd className="font-semibold text-slate-900">{detail.risk?.trainingScore ?? "N/A"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Quiz score</dt><dd className="font-semibold text-slate-900">{detail.risk?.quizScore ?? "N/A"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Phishing score</dt><dd className="font-semibold text-slate-900">{detail.risk?.phishingScore ?? "N/A"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Awareness score</dt><dd className="font-semibold text-slate-900">{detail.risk?.securityAwarenessScore ?? "N/A"}</dd></div>
            {detail.risk?.assessedAt && <div className="flex justify-between gap-3"><dt className="text-slate-500">Last assessed</dt><dd className="font-semibold text-slate-900">{formatDate(detail.risk.assessedAt)}</dd></div>}
          </dl>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><Activity className="text-blue-700" size={18} /><h2 className="text-xl font-semibold text-slate-900">Phishing simulation history</h2></div>
          {detail.phishing.attempts.length ? <div className="mt-4 space-y-3"><div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold uppercase text-slate-500"><span className="rounded bg-slate-100 p-2">Sent {detail.phishing.summary.sent}</span><span className="rounded bg-slate-100 p-2">Opened {detail.phishing.summary.opened}</span><span className="rounded bg-slate-100 p-2">Clicked {detail.phishing.summary.clicked}</span><span className="rounded bg-slate-100 p-2">Reported {detail.phishing.summary.reported}</span></div>{detail.phishing.attempts.slice(0, 8).map((attempt) => <div key={attempt._id} className="border-b border-slate-100 pb-3 last:border-0"><p className="font-semibold text-slate-900">{attempt.title || "Campaign"}</p><p className="mt-1 text-xs text-slate-500">Sent {formatDate(attempt.sentAt)} • {attempt.clicked ? `Clicked ${formatDate(attempt.clickedAt)}` : "Not clicked"}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No phishing simulation records found.</p>}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2"><BrainCircuit className="text-blue-700" size={18} /><h2 className="text-xl font-semibold text-slate-900">AI prediction</h2></div>
          {detail.aiPrediction ? <div className="mt-4 space-y-4"><div className="rounded-lg bg-blue-50 p-4"><p className="text-sm text-blue-700">Predicted risk</p><p className="mt-1 text-3xl font-bold text-blue-900">{detail.aiPrediction.predictedRisk}</p></div><dl className="space-y-2 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Confidence</dt><dd className="font-semibold text-slate-900">{Math.round((detail.aiPrediction.confidence || 0) * 100)}%</dd></div><div className="flex justify-between"><dt className="text-slate-500">Model</dt><dd className="font-semibold text-slate-900">{detail.aiPrediction.modelVersion}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Generated</dt><dd className="font-semibold text-slate-900">{formatDate(detail.aiPrediction.generatedAt)}</dd></div></dl></div> : <p className="mt-4 text-sm text-slate-500">No AI prediction is available for this employee.</p>}
        </article>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Administrative profile</h2>
        <form onSubmit={handleSave} className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">Designation<input value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} maxLength={120} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
          <label className="text-sm font-semibold text-slate-700">Department<select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="">Unassigned</option>{detail.departments?.map((department) => <option key={department._id} value={department._id}>{department.departmentName}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Account status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          <div className="md:col-span-3 flex justify-end"><button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button></div>
        </form>
      </article>
    </section>
  );
};

const MetricCard = ({ icon: Icon, label, value, detail }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2"><Icon size={16} className="text-blue-700" /><p className="text-sm font-medium text-slate-600">{label}</p></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>
);

export default EmployeeDetail;
