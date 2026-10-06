import { useEffect, useState } from "react";
import {
  createTraining,
  deleteTraining,
  getTrainings,
  updateTraining,
} from "../services/trainingService";

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
  const [editingId, setEditingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

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
      const payload = {
        ...form,
        duration: form.duration ? Number(form.duration) : undefined,
      };
      if (editingId) {
        await updateTraining(editingId, payload);
        setMessage("Training updated.");
      } else {
        await createTraining(payload);
        setMessage("Training published. Active employees have been notified.");
      }
      setForm(initialForm);
      setEditingId("");
      await loadTrainings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to publish training.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (training) => {
    setEditingId(training._id);
    setForm({
      title: training.title || "",
      description: training.description || "",
      category: training.category || "",
      type: training.type || "article",
      resourceURL: training.resourceURL || "",
      duration: training.duration || "",
    });
    setError("");
    setMessage("");
  };

  const handleDelete = async (training) => {
    if (!window.confirm(`Delete ${training.title}? Modules with employee progress cannot be deleted.`)) return;
    setDeletingId(training._id);
    setError("");
    setMessage("");
    try {
      await deleteTraining(training._id);
      setTrainings((current) => current.filter((item) => item._id !== training._id));
      if (editingId === training._id) {
        setEditingId("");
        setForm(initialForm);
      }
      setMessage("Training deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete training.");
    } finally {
      setDeletingId("");
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
        {editingId && <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">Edit training</h2><button type="button" onClick={() => { setEditingId(""); setForm(initialForm); }} className="text-sm font-semibold text-slate-600">Cancel</button></div>}
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
          {submitting ? "Saving..." : editingId ? "Save changes" : "Publish training"}
        </button>
      </form>

      <section>
        <h2 className="text-xl font-bold text-slate-900">Published training</h2>
        {loading ? <p className="mt-4 text-slate-500">Loading...</p> : trainings.length === 0 ? <p className="mt-4 text-slate-500">No training published yet.</p> : (
          <ul className="mt-3 divide-y divide-slate-200">
            {trainings.map((training) => (
              <li key={training._id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{training.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{training.description}</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleEdit(training)} className="text-sm font-semibold text-blue-700 hover:underline">Edit</button>
                  <button type="button" disabled={deletingId === training._id} onClick={() => handleDelete(training)} className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50">{deletingId === training._id ? "Deleting..." : "Delete"}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminTrainingManagement;