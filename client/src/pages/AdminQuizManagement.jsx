import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createQuestion,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getAdminQuizzes,
  getQuizQuestions,
  updateQuestion as saveQuestionUpdate,
} from "../services/adminQuizService";
import { getDepartments, getEmployees } from "../services/adminDirectoryService";

const newQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
});

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const getAssignedEmployeeCount = (quiz, employees) => {
  if (quiz.targetAll) return employees.length;

  const selectedUsers = new Set(quiz.targetUsers || []);
  const selectedDepartments = new Set(quiz.targetDepartments || []);

  employees.forEach((employee) => {
    const departmentId = employee.departmentId?._id || employee.departmentId;
    if (selectedDepartments.has(departmentId)) {
      selectedUsers.add(employee._id);
    }
  });

  return selectedUsers.size;
};

const AdminQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [questions, setQuestions] = useState([newQuestion()]);
    const [managingQuiz, setManagingQuiz] = useState(null);
    const [managedQuestions, setManagedQuestions] = useState([]);
    const [questionEditor, setQuestionEditor] = useState(newQuestion());
    const [editingQuestionId, setEditingQuestionId] = useState("");
  const [assignmentMode, setAssignmentMode] = useState("employees");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
    const [savingQuestion, setSavingQuestion] = useState(false);
    const [deletingQuizId, setDeletingQuizId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [quizRecords, employeeRecords, departmentRecords] = await Promise.all([
        getAdminQuizzes(),
        getEmployees(),
        getDepartments(),
      ]);
      const counts = await Promise.all(
        quizRecords.map(async (quiz) => [quiz._id, (await getQuizQuestions(quiz._id)).length])
      );
      setQuizzes(quizRecords);
      setQuestionCounts(Object.fromEntries(counts));
      setEmployees(employeeRecords);
      setDepartments(departmentRecords);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load quiz management data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  const updateQuestion = (index, field, value) => {
    setQuestions((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((current) => current.map((item, itemIndex) => {
      if (itemIndex !== questionIndex) return item;
      const options = item.options.map((option, index) => index === optionIndex ? value : option);
      const correctAnswer = item.correctAnswer === item.options[optionIndex]
        ? value
        : item.correctAnswer;
      return { ...item, options, correctAnswer };
    }));
  };

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((current) => current.includes(employeeId)
      ? current.filter((id) => id !== employeeId)
      : [...current, employeeId]);
  };

  const handleManageQuestions = async (quiz) => {
    setError("");
    setMessage("");
    try {
      const records = await getQuizQuestions(quiz._id);
      setManagingQuiz(quiz);
      setManagedQuestions(records);
      setEditingQuestionId("");
      setQuestionEditor(newQuestion());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load quiz questions."));
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question._id);
    setQuestionEditor({
      question: question.question,
      options: [...question.options, "", "", "", ""].slice(0, 4),
      correctAnswer: question.correctAnswer || "",
    });
  };

  const resetQuestionEditor = () => {
    setEditingQuestionId("");
    setQuestionEditor(newQuestion());
  };

  const handleSaveQuestion = async (event) => {
    event.preventDefault();
    if (!managingQuiz) return;
    const options = questionEditor.options.map((option) => option.trim());
    if (!questionEditor.question.trim() || options.some((option) => !option) || !options.includes(questionEditor.correctAnswer.trim())) {
      setError("Add a question, four answer options, and select the correct answer.");
      return;
    }

    setSavingQuestion(true);
    setError("");
    setMessage("");
    const payload = {
      question: questionEditor.question.trim(),
      options,
      correctAnswer: questionEditor.correctAnswer.trim(),
    };
    try {
      if (editingQuestionId) {
        const response = await saveQuestionUpdate(editingQuestionId, payload);
        setManagedQuestions((current) => current.map((question) => (
          question._id === editingQuestionId ? response.data : question
        )));
        setMessage("Question updated.");
      } else {
        const response = await createQuestion(managingQuiz._id, payload);
        setManagedQuestions((current) => [...current, response.data]);
        setQuestionCounts((current) => ({
          ...current,
          [managingQuiz._id]: (current[managingQuiz._id] || 0) + 1,
        }));
        setMessage("Question added.");
      }
      resetQuestionEditor();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to save question."));
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm("Delete this question?")) return;
    setError("");
    try {
      await deleteQuestion(question._id);
      setManagedQuestions((current) => current.filter((item) => item._id !== question._id));
      setQuestionCounts((current) => ({
        ...current,
        [managingQuiz._id]: Math.max(0, (current[managingQuiz._id] || 0) - 1),
      }));
      if (editingQuestionId === question._id) resetQuestionEditor();
      setMessage("Question deleted.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete question."));
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(`Delete ${quiz.title}? Existing employee results are preserved and prevent quiz deletion.`)) return;
    setDeletingQuizId(quiz._id);
    setError("");
    setMessage("");
    try {
      await deleteQuiz(quiz._id);
      if (managingQuiz?._id === quiz._id) {
        setManagingQuiz(null);
        setManagedQuestions([]);
      }
      setMessage("Quiz deleted.");
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete quiz."));
    } finally {
      setDeletingQuizId("");
    }
  };

  const validate = () => {
    if (!form.title.trim()) return "Quiz title is required.";
    if (assignmentMode === "employees" && selectedEmployees.length === 0) {
      return "Select at least one employee.";
    }
    if (assignmentMode === "department" && !selectedDepartment) {
      return "Select a department.";
    }
    for (const [index, item] of questions.entries()) {
      const options = item.options.map((option) => option.trim());
      if (!item.question.trim() || options.some((option) => !option)) {
        return `Question ${index + 1} and all four answer options are required.`;
      }
      if (!item.correctAnswer || !options.includes(item.correctAnswer.trim())) {
        return `Choose the correct answer for question ${index + 1}.`;
      }
    }
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
      const quizResponse = await createQuiz({
        title: form.title.trim(),
        description: form.description.trim(),
        targetUsers: assignmentMode === "employees" ? selectedEmployees : [],
        targetDepartments: assignmentMode === "department" ? [selectedDepartment] : [],
        targetAll: false,
      });
      const quizId = quizResponse.data._id;
      await Promise.all(questions.map((item) => createQuestion(quizId, {
        question: item.question.trim(),
        options: item.options.map((option) => option.trim()),
        correctAnswer: item.correctAnswer.trim(),
      })));
      setMessage("Quiz and all questions were created successfully.");
      setForm({ title: "", description: "" });
      setQuestions([newQuestion()]);
      setSelectedEmployees([]);
      setSelectedDepartment("");
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Quiz creation failed. The server may have created a partial quiz; refresh to verify."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-quiz-page">
      <header className="admin-page-header">
        <p className="section-kicker admin-page-kicker">Admin Workspace</p>
        <h1 className="admin-page-title">Quiz Management</h1>
        <p className="admin-page-subtitle">Create assigned quizzes with their questions in one workflow.</p>
      </header>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {message && <div className="admin-alert admin-alert-success">{message}</div>}

      <form onSubmit={handleSubmit} className="admin-card admin-form-card">
        <div className="admin-form-grid">
          <label className="admin-form-field admin-form-field-full">
            <span>Quiz title</span>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>
          <label className="admin-form-field admin-form-field-full">
            <span>Description</span>
            <textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
        </div>

        <div className="admin-panel-divider">
          <div className="admin-section-header">
            <h2>Questions</h2>
            <button type="button" onClick={() => setQuestions([...questions, newQuestion()])} className="admin-add-button"><Plus size={16} /> Add question</button>
          </div>
          <div className="admin-question-stack">
            {questions.map((item, questionIndex) => (
              <fieldset key={questionIndex} className="admin-question-card">
                <div className="admin-question-head">
                  <legend>Question {questionIndex + 1}</legend>
                  {questions.length > 1 && <button type="button" onClick={() => setQuestions(questions.filter((_, index) => index !== questionIndex))} className="admin-remove-button"><Trash2 size={15} /> Remove</button>}
                </div>
                <input placeholder="Question text" value={item.question} onChange={(event) => updateQuestion(questionIndex, "question", event.target.value)} required />
                <div className="admin-answer-grid">
                  {item.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="admin-answer-row">
                      <input placeholder={`Answer option ${optionIndex + 1}`} value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} required />
                      <button type="button" onClick={() => updateQuestion(questionIndex, "correctAnswer", option)} className={`admin-correct-button ${item.correctAnswer === option && option ? "is-correct" : ""}`}>Correct</button>
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <div className="admin-panel-divider">
          <h2 className="admin-section-title">Assignment</h2>
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

        <button type="submit" disabled={submitting} className="admin-primary-button">{submitting ? "Creating quiz..." : "Create quiz"}</button>
      </form>

      <section className="admin-card admin-table-card">
        <h2 className="admin-section-title">Existing quizzes</h2>
        {loading ? <p className="admin-empty-text mt-4">Loading quizzes...</p> : quizzes.length === 0 ? <p className="admin-empty-text mt-4">No quizzes have been created yet.</p> : <div className="admin-table-wrap"><table className="admin-quiz-table"><thead><tr><th>Title</th><th>Questions</th><th>Assigned employees</th><th>Created</th><th>Actions</th></tr></thead><tbody>{quizzes.map((quiz) => <tr key={quiz._id}><td className="admin-quiz-title-cell">{quiz.title}</td><td>{questionCounts[quiz._id] ?? "-"}</td><td>{getAssignedEmployeeCount(quiz, employees)}</td><td>{quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "-"}</td><td><div className="admin-table-actions"><button type="button" onClick={() => handleManageQuestions(quiz)} className="admin-link-button">Questions</button><button type="button" disabled={deletingQuizId === quiz._id} onClick={() => handleDeleteQuiz(quiz)} className="admin-link-button admin-link-button-danger">{deletingQuizId === quiz._id ? "Deleting..." : "Delete"}</button></div></td></tr>)}</tbody></table></div>}
      </section>

      {managingQuiz && (
        <section className="admin-card admin-manage-card">
          <div className="admin-manage-header">
            <div>
              <h2>Manage questions</h2>
              <p>{managingQuiz.title} · {managedQuestions.length} questions</p>
              <p className="admin-manage-note">Question changes are locked after the first employee submission to preserve result history.</p>
            </div>
            <button type="button" onClick={() => setManagingQuiz(null)} className="admin-close-button">Close</button>
          </div>

          <ul className="admin-question-list">
            {managedQuestions.map((question, index) => (
              <li key={question._id}>
                <div>
                  <p>{index + 1}. {question.question}</p>
                  <span>Correct answer: {question.correctAnswer}</span>
                </div>
                <div className="admin-inline-actions">
                  <button type="button" onClick={() => handleEditQuestion(question)} className="admin-link-button">Edit</button>
                  <button type="button" onClick={() => handleDeleteQuestion(question)} className="admin-link-button admin-link-button-danger">Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSaveQuestion} className="admin-manage-form">
            <h3>{editingQuestionId ? "Edit question" : "Add question"}</h3>
            <label className="admin-form-field admin-form-field-full">
              <span>Question</span>
              <input required maxLength={500} value={questionEditor.question} onChange={(event) => setQuestionEditor({ ...questionEditor, question: event.target.value })} />
            </label>
            <div className="admin-answer-grid">
              {questionEditor.options.map((option, index) => (
                <label key={index} className="admin-form-field">
                  <span>Option {index + 1}</span>
                  <span className="admin-radio-row">
                    <input required maxLength={250} value={option} onChange={(event) => setQuestionEditor({ ...questionEditor, options: questionEditor.options.map((current, optionIndex) => optionIndex === index ? event.target.value : current) })} />
                    <input type="radio" name="correctAnswer" checked={questionEditor.correctAnswer === option && Boolean(option)} onChange={() => setQuestionEditor({ ...questionEditor, correctAnswer: option })} aria-label={`Mark option ${index + 1} correct`} />
                  </span>
                </label>
              ))}
            </div>
            <div className="admin-inline-actions admin-inline-actions-top">
              <button type="submit" disabled={savingQuestion} className="admin-primary-button admin-save-button">{savingQuestion ? "Saving..." : editingQuestionId ? "Save question" : "Add question"}</button>
              {editingQuestionId && <button type="button" onClick={resetQuestionEditor} className="admin-secondary-button">Cancel edit</button>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default AdminQuizManagement;
