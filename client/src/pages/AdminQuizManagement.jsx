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
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Admin Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Quiz Management</h1>
        <p className="mt-2 text-slate-600">Create assigned quizzes with their questions in one workflow.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-medium text-emerald-700">{message}</div>}

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Quiz title</span>
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>
          <label className="md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Questions</h2>
            <button type="button" onClick={() => setQuestions([...questions, newQuestion()])} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Plus size={16} /> Add question</button>
          </div>
          <div className="mt-5 space-y-5">
            {questions.map((item, questionIndex) => (
              <fieldset key={questionIndex} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <legend className="font-semibold text-slate-800">Question {questionIndex + 1}</legend>
                  {questions.length > 1 && <button type="button" onClick={() => setQuestions(questions.filter((_, index) => index !== questionIndex))} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600"><Trash2 size={15} /> Remove</button>}
                </div>
                <input className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Question text" value={item.question} onChange={(event) => updateQuestion(questionIndex, "question", event.target.value)} required />
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {item.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder={`Answer option ${optionIndex + 1}`} value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} required />
                      <button type="button" onClick={() => updateQuestion(questionIndex, "correctAnswer", option)} className={`rounded-lg px-3 text-xs font-semibold ${item.correctAnswer === option && option ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-slate-600"}`}>Correct</button>
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-xl font-bold text-slate-900">Assignment</h2>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setAssignmentMode("employees")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${assignmentMode === "employees" ? "bg-blue-600 text-white" : "border border-slate-300 text-slate-700"}`}>Specific employees</button>
            <button type="button" onClick={() => setAssignmentMode("department")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${assignmentMode === "department" ? "bg-blue-600 text-white" : "border border-slate-300 text-slate-700"}`}>Department</button>
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

        <button type="submit" disabled={submitting} className="mt-8 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Creating quiz..." : "Create quiz"}</button>
      </form>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Existing quizzes</h2>
        {loading ? <p className="mt-4 text-slate-500">Loading quizzes...</p> : quizzes.length === 0 ? <p className="mt-4 text-slate-500">No quizzes have been created yet.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Title</th><th className="px-3 py-3">Questions</th><th className="px-3 py-3">Assigned employees</th><th className="px-3 py-3">Created</th><th className="px-3 py-3">Actions</th></tr></thead><tbody>{quizzes.map((quiz) => <tr key={quiz._id} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold text-slate-800">{quiz.title}</td><td className="px-3 py-3">{questionCounts[quiz._id] ?? "-"}</td><td className="px-3 py-3">{getAssignedEmployeeCount(quiz, employees)}</td><td className="px-3 py-3">{quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "-"}</td><td className="px-3 py-3"><div className="flex gap-3"><button type="button" onClick={() => handleManageQuestions(quiz)} className="font-semibold text-blue-700 hover:underline">Questions</button><button type="button" disabled={deletingQuizId === quiz._id} onClick={() => handleDeleteQuiz(quiz)} className="font-semibold text-red-700 hover:underline disabled:opacity-50">{deletingQuizId === quiz._id ? "Deleting..." : "Delete"}</button></div></td></tr>)}</tbody></table></div>}
      </section>

      {managingQuiz && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Manage questions</h2>
              <p className="mt-1 text-sm text-slate-600">{managingQuiz.title} · {managedQuestions.length} questions</p>
              <p className="mt-1 text-xs text-slate-500">Question changes are locked after the first employee submission to preserve result history.</p>
            </div>
            <button type="button" onClick={() => setManagingQuiz(null)} className="text-sm font-semibold text-slate-600 hover:text-slate-900">Close</button>
          </div>

          <ul className="mt-5 divide-y divide-slate-200">
            {managedQuestions.map((question, index) => (
              <li key={question._id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold text-slate-900">{index + 1}. {question.question}</p>
                  <p className="mt-1 text-sm text-slate-600">Correct answer: {question.correctAnswer}</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleEditQuestion(question)} className="text-sm font-semibold text-blue-700 hover:underline">Edit</button>
                  <button type="button" onClick={() => handleDeleteQuestion(question)} className="text-sm font-semibold text-red-700 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSaveQuestion} className="mt-5 space-y-4 border-t border-slate-200 pt-5">
            <h3 className="font-semibold text-slate-900">{editingQuestionId ? "Edit question" : "Add question"}</h3>
            <label className="block text-sm font-semibold text-slate-700">Question<input required maxLength={500} value={questionEditor.question} onChange={(event) => setQuestionEditor({ ...questionEditor, question: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <div className="grid gap-3 md:grid-cols-2">
              {questionEditor.options.map((option, index) => (
                <label key={index} className="text-sm font-semibold text-slate-700">Option {index + 1}<span className="mt-1 flex gap-2"><input required maxLength={250} value={option} onChange={(event) => setQuestionEditor({ ...questionEditor, options: questionEditor.options.map((current, optionIndex) => optionIndex === index ? event.target.value : current) })} className="w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /><input type="radio" name="correctAnswer" checked={questionEditor.correctAnswer === option && Boolean(option)} onChange={() => setQuestionEditor({ ...questionEditor, correctAnswer: option })} aria-label={`Mark option ${index + 1} correct`} /></span></label>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={savingQuestion} className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{savingQuestion ? "Saving..." : editingQuestionId ? "Save question" : "Add question"}</button>
              {editingQuestionId && <button type="button" onClick={resetQuestionEditor} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">Cancel edit</button>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default AdminQuizManagement;
