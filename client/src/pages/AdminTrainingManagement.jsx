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
    <div className="admin-training-page">
      <header className="admin-page-header">
        <p className="section-kicker admin-page-kicker">Admin Workspace</p>
        <h1 className="admin-page-title">Training Management</h1>
        <p className="admin-page-subtitle">Publish training for active employees.</p>
      </header>

      {error && <p role="alert" className="admin-alert admin-alert-error">{error}</p>}
      {message && <p role="status" className="admin-alert admin-alert-success">{message}</p>}

      <form onSubmit={handleSubmit} className="admin-card admin-training-form-card">
        {editingId && <div className="admin-training-edit-header"><h2>Edit training</h2><button type="button" onClick={() => { setEditingId(""); setForm(initialForm); }} className="admin-close-button">Cancel</button></div>}
        <div className="admin-form-grid">
          <label className="admin-form-field">
            <span>Title</span>
            <input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label className="admin-form-field">
            <span>Category</span>
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          </label>
          <label className="admin-form-field admin-form-field-full">
            <span>Description</span>
            <textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
          <label className="admin-form-field">
            <span>Format</span>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="admin-select-field">
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="admin-form-field">
            <span>Duration (minutes)</span>
            <input type="number" min="1" step="1" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} />
          </label>
          <label className="admin-form-field admin-form-field-full">
            <span>Resource URL</span>
            <input type="url" value={form.resourceURL} onChange={(event) => setForm({ ...form, resourceURL: event.target.value })} />
          </label>
        </div>
        <button type="submit" disabled={submitting} className="admin-primary-button">
          {submitting ? "Saving..." : editingId ? "Save changes" : "Publish training"}
        </button>
      </form>

      <section className="admin-card admin-training-list-card">
        <h2 className="admin-section-title">Published training</h2>
        {loading ? <p className="admin-empty-text mt-4">Loading...</p> : trainings.length === 0 ? <p className="admin-empty-text mt-4">No training published yet.</p> : (
          <div className="admin-training-list-wrap">
            <table className="admin-training-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map((training) => (
                  <tr key={training._id}>
                    <td className="admin-training-title-cell">{training.title}</td>
                    <td>{training.type || "-"}</td>
                    <td>{training.category || "-"}</td>
                    <td>{training.duration ? `${training.duration} min` : "-"}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button type="button" onClick={() => handleEdit(training)} className="admin-link-button">Edit</button>
                        <button type="button" disabled={deletingId === training._id} onClick={() => handleDelete(training)} className="admin-link-button admin-link-button-danger">{deletingId === training._id ? "Deleting..." : "Delete"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminTrainingManagement;