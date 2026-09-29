import { useEffect, useState } from "react";
import { createTraining, getTrainings } from "../services/trainingService";

const initialForm = {
  title: "",
  description: "",
  category: "",
  type: "article",
  resourceURL: "",
  duration: "",
};

const AdminTrainingManagement = () => {
  const [form, setForm] = useState(initialForm);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTrainings = async () => {
    try {
      const response = await getTrainings();
      setTrainings(response.data || []);
    } catch {
      setError("Unable to load training materials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadTrainings);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await createTraining({
        ...form,
        duration: form.duration ? Number(form.duration) : undefined,
      });
      setForm(initialForm);
      setMessage("Training published. Active employees have been notified.");
      await loadTrainings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to publish training.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Admin Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Training Management</h1>
        <p className="mt-2 text-slate-600">Publish training for active employees.</p>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-5 border-b border-slate-200 pb-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm font-semibold text-slate-700">Title</span>
            <input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-700">Category</span>
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-700">Format</span>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-700">Duration (minutes)</span>
            <input type="number" min="1" step="1" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Resource URL</span>
            <input type="url" value={form.resourceURL} onChange={(event) => setForm({ ...form, resourceURL: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
        </div>
        <button type="submit" disabled={submitting} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {submitting ? "Publishing..." : "Publish training"}
        </button>
      </form>

      <section>
        <h2 className="text-xl font-bold text-slate-900">Published training</h2>
        {loading ? <p className="mt-4 text-slate-500">Loading...</p> : trainings.length === 0 ? <p className="mt-4 text-slate-500">No training published yet.</p> : (
          <ul className="mt-3 divide-y divide-slate-200">
            {trainings.map((training) => (
              <li key={training._id} className="py-4">
                <h3 className="font-semibold text-slate-900">{training.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{training.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminTrainingManagement;