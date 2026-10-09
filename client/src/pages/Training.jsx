import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  completeTrainingLesson,
  getTrainingProgress,
  getTrainings,
  getTrainingKnowledgeCheck,
  openTrainingLesson,
  submitTrainingKnowledgeCheck,
} from "../services/trainingService";
import { getMyQuizResults } from "../services/quizService";

const getId = (value) => String(value?._id || value || "");

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getScore = (result) => {
  if (Number.isFinite(result.percentage)) return result.percentage;
  if (result.totalQuestions > 0) return (result.correctAnswers / result.totalQuestions) * 100;
  return null;
};

const Training = () => {
  const [searchParams] = useSearchParams();
  const requestedTrainingId = searchParams.get("trainingId");
  const [trainings, setTrainings] = useState([]);
  const [progressByTraining, setProgressByTraining] = useState({});
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [view, setView] = useState("library");
  const [knowledgeCheck, setKnowledgeCheck] = useState([]);
  const [answers, setAnswers] = useState({});
  const [checkResult, setCheckResult] = useState(null);
  const [weakCategory, setWeakCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    const loadTraining = async () => {
      setLoading(true);
      setError("");
      try {
        const [trainingResponse, progressResponse, quizResults] = await Promise.all([
          getTrainings(),
          getTrainingProgress(),
          getMyQuizResults().catch(() => []),
        ]);
        if (!isActive) return;

        const courseRecords = trainingResponse.data || [];
        const progressMap = (progressResponse.data || []).reduce((records, record) => {
          records[getId(record.trainingId)] = record;
          return records;
        }, {});
        const scoresByCategory = new Map();
        quizResults.forEach((result) => {
          const category = result.quizId?.category;
          const score = getScore(result);
          if (!category || !Number.isFinite(score)) return;
          scoresByCategory.set(category, [...(scoresByCategory.get(category) || []), score]);
        });
        const weakest = [...scoresByCategory.entries()]
          .map(([category, scores]) => ({ category, average: scores.reduce((sum, score) => sum + score, 0) / scores.length }))
          .sort((left, right) => left.average - right.average)[0];

        setTrainings(courseRecords);
        setProgressByTraining(progressMap);
        setWeakCategory(weakest?.category || "");

        const requestedCourse = courseRecords.find((training) => getId(training._id) === requestedTrainingId);
        if (requestedCourse) {
          const record = progressMap[getId(requestedCourse._id)];
          const completedLessons = record?.completedLessons || [];
          const firstUnfinished = requestedCourse.lessons?.findIndex((_, index) => !completedLessons.includes(index)) ?? 0;
          const lessonIndex = Math.max(0, firstUnfinished);
          setSelectedTrainingId(getId(requestedCourse._id));
          setActiveLessonIndex(lessonIndex);
          if (requestedCourse.lessons?.length && lessonIndex >= requestedCourse.lessons.length) {
            const questions = await getTrainingKnowledgeCheck(getId(requestedCourse._id));
            setKnowledgeCheck(questions || []);
            setView("check");
          } else {
            setView("lesson");
          }
          if (requestedCourse.lessons?.[lessonIndex]) {
            const opened = await openTrainingLesson(getId(requestedCourse._id), lessonIndex);
            setProgressByTraining((current) => ({ ...current, [getId(requestedCourse._id)]: opened.data }));
          }
        }
      } catch (requestError) {
        if (isActive) {
          const status = requestError.response?.status;
          setError(status === 401 || status === 403
            ? "You are not authorized to view training."
            : "Unable to load training. Please try again.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };
    void loadTraining();
    return () => { isActive = false; };
  }, [requestedTrainingId, retryCount]);

  const trainingById = useMemo(() => new Map(trainings.map((training) => [getId(training._id), training])), [trainings]);
  const activeTraining = selectedTrainingId ? trainingById.get(selectedTrainingId) : null;
  const activeProgress = activeTraining ? progressByTraining[selectedTrainingId] : null;
  const activeLesson = activeTraining?.lessons?.[activeLessonIndex] || null;
  const learnedMinutes = trainings.reduce((total, training) => {
    const minutes = Number(training.estimatedMinutes || training.duration) || 0;
    return total + Math.round(minutes * ((progressByTraining[getId(training._id)]?.progress || 0) / 100));
  }, 0);
  const completedCount = trainings.filter((training) => progressByTraining[getId(training._id)]?.completed).length;
  const inProgressCount = trainings.filter((training) => {
    const record = progressByTraining[getId(training._id)];
    return record && !record.completed && (record.openedLessons?.length || record.completedLessons?.length || record.knowledgeCheckAttempts || record.legacyCompletion || record.progress > 0);
  }).length;
  const recommendedNext = activeTraining
    ? trainings.find((training) => training._id !== activeTraining._id && training.category === activeTraining.category && !progressByTraining[getId(training._id)]?.completed)
      || trainings.find((training) => training._id !== activeTraining._id && !progressByTraining[getId(training._id)]?.completed)
    : null;

  const updateProgress = (record) => {
    if (!record?.trainingId) return;
    setProgressByTraining((current) => ({ ...current, [getId(record.trainingId)]: record }));
  };

  const startTraining = async (training) => {
    setActionError("");
    setSelectedTrainingId(getId(training._id));
    setAnswers({});
    setCheckResult(null);
    const completed = progressByTraining[getId(training._id)]?.completedLessons || [];
    const firstUnfinished = training.lessons?.findIndex((_, index) => !completed.includes(index)) ?? 0;
    const lessonIndex = Math.max(0, firstUnfinished);
    setActiveLessonIndex(lessonIndex);
    if (training.lessons?.length && lessonIndex >= training.lessons.length) {
      await showKnowledgeCheck(training);
      return;
    }
    if (!training.lessons?.length) {
      setView("lesson");
      return;
    }
    setBusy(true);
    try {
      const response = await openTrainingLesson(getId(training._id), lessonIndex);
      updateProgress(response.data);
      setView("lesson");
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Unable to open this lesson.");
    } finally {
      setBusy(false);
    }
  };

  const showKnowledgeCheck = async (training = activeTraining) => {
    if (!training) return;
    setBusy(true);
    setActionError("");
    try {
      const questions = await getTrainingKnowledgeCheck(getId(training._id));
      setKnowledgeCheck(questions || []);
      setAnswers({});
      setCheckResult(null);
      setView("check");
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Unable to load the knowledge check.");
    } finally {
      setBusy(false);
    }
  };

  const handleNextLesson = async () => {
    if (!activeTraining || !activeLesson) return;
    setBusy(true);
    setActionError("");
    try {
      const finished = await completeTrainingLesson(selectedTrainingId, activeLessonIndex);
      updateProgress(finished.data);
      const nextIndex = activeLessonIndex + 1;
      if (nextIndex >= activeTraining.lessons.length) {
        await showKnowledgeCheck(activeTraining);
      } else {
        const opened = await openTrainingLesson(selectedTrainingId, nextIndex);
        updateProgress(opened.data);
        setActiveLessonIndex(nextIndex);
      }
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Unable to save lesson progress.");
    } finally {
      setBusy(false);
    }
  };

  const handlePreviousLesson = async () => {
    if (!activeTraining || activeLessonIndex === 0) return;
    const previousIndex = activeLessonIndex - 1;
    setBusy(true);
    setActionError("");
    try {
      const response = await openTrainingLesson(selectedTrainingId, previousIndex);
      updateProgress(response.data);
      setActiveLessonIndex(previousIndex);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Unable to open the previous lesson.");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitCheck = async (event) => {
    event.preventDefault();
    if (!activeTraining || knowledgeCheck.some((_, index) => !Number.isInteger(answers[index]))) return;
    setBusy(true);
    setActionError("");
    try {
      const response = await submitTrainingKnowledgeCheck(
        selectedTrainingId,
        knowledgeCheck.map((_, index) => answers[index])
      );
      updateProgress(response.data);
      setCheckResult(response.data);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Unable to submit the knowledge check.");
    } finally {
      setBusy(false);
    }
  };

  const returnToLibrary = () => {
    setSelectedTrainingId(null);
    setView("library");
    setActionError("");
    setCheckResult(null);
  };

  const learner = getStoredUser();
  const learnerName = `${learner?.firstName || ""} ${learner?.lastName || ""}`.trim() || learner?.name || "Employee";

  if (loading) return <div className="training-state-card" role="status">Loading courses and your learning progress...</div>;
  if (error) {
    return (
      <div className="training-state-card training-error-card">
        <p>{error}</p>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="quiz-primary-button training-retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="training-page-shell">
      <section className="training-page-header">
        <p className="section-kicker">Security learning</p>
        <h1>Practical Security Courses</h1>
        <p>Short lessons for the decisions you make every day at work.</p>
      </section>

      <section className="my-learning-summary" aria-label="My learning summary">
        <div><strong>{completedCount}</strong><span>Courses completed</span></div>
        <div><strong>{inProgressCount}</strong><span>In progress</span></div>
        <div><strong>{learnedMinutes}</strong><span>Minutes learned</span></div>
        <div><strong>{trainings.length}</strong><span>Total courses</span></div>
      </section>

      {actionError && <p role="alert" className="training-alert">{actionError}</p>}

      {view === "library" || !activeTraining ? (
        trainings.length === 0 ? (
          <div className="training-state-card">No courses are available yet.</div>
        ) : (
          <section className="training-section">
            <h2 className="panel-title">Your courses</h2>
            {weakCategory && <p className="training-focus-note">Your quiz results show {weakCategory} is a useful topic to revisit.</p>}
            <div className="training-grid">
              {trainings.map((training) => {
                const id = getId(training._id);
                const record = progressByTraining[id];
                const progress = Math.max(0, Math.min(100, record?.progress || 0));
                const status = record?.completed ? "Completed" : record && (record.openedLessons?.length || record.completedLessons?.length || record.knowledgeCheckAttempts || record.legacyCompletion || record.progress > 0) ? "In progress" : "Not started";
                const courseCategory = String(training.category || "").toLowerCase();
                const hasWeakMatch = weakCategory && courseCategory.includes(weakCategory.toLowerCase());
                const actionLabel = status === "Completed" ? "Review" : status === "In progress" ? "Continue" : "Start";
                return (
                  <article key={id} className={`training-card ${hasWeakMatch ? "training-card-focus" : ""}`}>
                    <div className="training-card-header">
                      <div className="training-card-copy">
                        <p className="training-category-label">{training.category || "Security awareness"}</p>
                        <h3>{training.title}</h3>
                        <p>{training.description}</p>
                      </div>
                      <span className={`training-status-badge training-status-${status.toLowerCase().replace(" ", "-")}`}>{status}</span>
                    </div>
                    <div className="training-course-meta">
                      <span>{training.difficulty || "Beginner"}</span>
                      <span>{training.estimatedMinutes || training.duration || "Self-paced"}{training.estimatedMinutes || training.duration ? " min" : ""}</span>
                      <span>{training.lessons?.length || 0} lessons</span>
                    </div>
                    <div className="training-card-meta"><span>{record?.completedLessonCount || 0}/{training.lessons?.length || 0} lessons</span><span>{progress}%</span></div>
                    <div className="training-progress-track" role="progressbar" aria-label={`${training.title} progress`} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                      <div className="training-progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    {hasWeakMatch && <p className="training-focus-tag">Recommended for your {weakCategory} quiz results</p>}
                    {record?.legacyCompletion && <p className="training-legacy-note">Your previous completion record is retained. This updated course tracks lessons and the knowledge check separately.</p>}
                    {record?.legacyProgress && <p className="training-legacy-note">Previous progress ({record.legacyProgressPercent}%) is retained in your record; new course progress is tracked lesson by lesson.</p>}
                    <button type="button" disabled={busy} onClick={() => void startTraining(training)} className="training-toggle-button">{actionLabel}</button>
                  </article>
                );
              })}
            </div>
          </section>
        )
      ) : (
        <section className="training-course-view">
          <div className="training-view-toolbar">
            <button type="button" onClick={returnToLibrary} className="training-back-button">Back to courses</button>
            <span>{activeTraining.category} · {activeTraining.difficulty || "Beginner"}</span>
          </div>

          {view === "lesson" && activeLesson && (
            <article className="training-lesson-panel">
              <p className="section-kicker">{activeTraining.title}</p>
              <h2>{activeLesson.title}</h2>
              <p className="training-lesson-indicator">Lesson {activeLessonIndex + 1} of {activeTraining.lessons.length}</p>
              <div className="training-lesson-progress" role="progressbar" aria-label="Lesson progress" aria-valuenow={Math.round(((activeLessonIndex + 1) / activeTraining.lessons.length) * 100)} aria-valuemin="0" aria-valuemax="100">
                <div style={{ width: `${((activeLessonIndex + 1) / activeTraining.lessons.length) * 100}%` }} />
              </div>
              <div className="training-lesson-body">
                {(Array.isArray(activeLesson.body) ? activeLesson.body : [activeLesson.body]).map((paragraph, index) => <p key={`${activeLesson.title}-${index}`}>{paragraph}</p>)}
              </div>
              {activeLesson.realWorldExample && <aside className="training-example"><strong>In practice</strong><p>{activeLesson.realWorldExample}</p></aside>}
              {activeLesson.redFlags?.length > 0 && <div className="training-red-flags"><h3>Warning signs</h3><ul>{activeLesson.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul></div>}
              <div className="training-takeaways"><h3>Key takeaways</h3><ul>{activeLesson.keyTakeaways?.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ul></div>
              <div className="training-lesson-actions">
                <button type="button" disabled={busy || activeLessonIndex === 0} onClick={() => void handlePreviousLesson()} className="training-secondary-button">Previous</button>
                <button type="button" disabled={busy} onClick={() => void handleNextLesson()} className="training-toggle-button">
                  {busy ? "Saving..." : activeLessonIndex === activeTraining.lessons.length - 1 ? "Finish lesson and take knowledge check" : "Finish lesson and continue"}
                </button>
              </div>
            </article>
          )}

          {view === "check" && (
            <article className="training-check-panel">
              {checkResult?.completed && checkResult?.passedThisAttempt ? (
                <div className="training-completion-screen">
                  <p className="section-kicker">Course completed</p>
                  <h2>{activeTraining.title}</h2>
                  <p>You scored {checkResult.attemptScore}% on the knowledge check. Your completion is saved.</p>
                  <div className="training-certificate">
                    <p>Certificate of Completion</p>
                    <h3>{activeTraining.title}</h3>
                    <p>Presented to <strong>{learnerName}</strong></p>
                    <p>Completed {new Date(checkResult.completedAt || new Date()).toLocaleDateString()}</p>
                    <button type="button" onClick={() => window.print()} className="training-secondary-button">Print certificate</button>
                  </div>
                  {recommendedNext && <div className="training-next-course"><h3>Recommended next course</h3><p>{recommendedNext.title} · {recommendedNext.category}</p><button type="button" onClick={() => void startTraining(recommendedNext)} className="training-toggle-button">Start next course</button></div>}
                  <button type="button" onClick={returnToLibrary} className="training-secondary-button">Return to courses</button>
                </div>
              ) : (
                <>
                  <p className="section-kicker">Knowledge check</p>
                  <h2>{activeTraining.title}</h2>
                  <p>Choose one answer for each question. You need {checkResult?.passPercent || activeProgress?.passPercent || activeTraining.knowledgeCheckPassPercent}% to pass. You can retake the check.</p>
                  {knowledgeCheck.length === 0 ? (
                    <p className="training-state-card">This course does not have a knowledge check yet.</p>
                  ) : (
                    <form onSubmit={(event) => void handleSubmitCheck(event)}>
                      {knowledgeCheck.map((item, questionIndex) => (
                        <fieldset key={`${questionIndex}-${item.question}`} className="training-check-question">
                          <legend>{questionIndex + 1}. {item.question}</legend>
                          {item.options.map((option, optionIndex) => (
                            <label key={option} className="training-check-option">
                              <input type="radio" name={`question-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))} />
                              <span>{option}</span>
                            </label>
                          ))}
                        </fieldset>
                      ))}
                      {checkResult && <p role="status" className={checkResult.passedThisAttempt ? "training-check-success" : "training-check-retry"}>{checkResult.passedThisAttempt ? `Passed: ${checkResult.attemptScore}% (${checkResult.correctAnswers}/${checkResult.totalQuestions}).` : `You scored ${checkResult.attemptScore}% (${checkResult.correctAnswers}/${checkResult.totalQuestions}). Review the lessons and try again.`}</p>}
                      <div className="training-lesson-actions">
                        <button type="button" onClick={() => { setView("lesson"); setActiveLessonIndex(Math.max(0, activeTraining.lessons.length - 1)); }} className="training-secondary-button">Review lessons</button>
                        <button type="submit" disabled={busy || knowledgeCheck.some((_, index) => !Number.isInteger(answers[index]))} className="training-toggle-button">{busy ? "Checking..." : checkResult ? "Retake knowledge check" : "Submit knowledge check"}</button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </article>
          )}

          {view === "lesson" && !activeLesson && <div className="training-state-card">This course is being prepared with lesson content. Your saved progress remains available.</div>}
        </section>
      )}
      <Link to="/phishing" className="training-quiz-link">Practice phishing awareness</Link>
    </div>
  );
};

export default Training;