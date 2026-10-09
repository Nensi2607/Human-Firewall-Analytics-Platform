const { KNOWLEDGE_CHECK_PASS_PERCENT } = require("../config/trainingConfig");

const normalizeIndexes = (indexes, lessonCount) => [...new Set(
  (Array.isArray(indexes) ? indexes : []).filter((index) =>
    Number.isInteger(index) && index >= 0 && index < lessonCount
  )
)];

function calculateTrainingProgress(record = {}, training = {}) {
  const lessonCount = Array.isArray(training.lessons) ? training.lessons.length : 0;
  const questions = training.knowledgeCheck?.questions || [];
  const openedLessons = normalizeIndexes(record.openedLessons, lessonCount).sort((a, b) => a - b);
  const completedLessons = normalizeIndexes(record.completedLessons, lessonCount).sort((a, b) => a - b);
  const hasAssessment = questions.length > 0;
  const allLessonsFinished = lessonCount > 0 && completedLessons.length === lessonCount;
  const knowledgeCheckPassed = hasAssessment && record.knowledgeCheckPassed === true;
  const completed = allLessonsFinished && knowledgeCheckPassed;
  const totalSteps = lessonCount + (hasAssessment ? 1 : 0);
  const finishedSteps = completedLessons.length + (knowledgeCheckPassed ? 1 : 0);
  const progress = totalSteps ? Math.round((finishedSteps / totalSteps) * 100) : 0;
  const hasNewProgress = openedLessons.length > 0 || completedLessons.length > 0 || record.knowledgeCheckAttempts > 0;
  const legacyCompletedValue = typeof record.legacyCompletedValue === "boolean"
    ? record.legacyCompletedValue
    : record.completed === true && !completed;
  const legacyProgressValue = Number.isFinite(record.legacyProgressValue)
    ? record.legacyProgressValue
    : !hasNewProgress && Number.isFinite(record.progress) ? record.progress : null;

  return {
    ...record,
    openedLessons,
    completedLessons,
    knowledgeCheckAttempts: Number.isInteger(record.knowledgeCheckAttempts)
      ? record.knowledgeCheckAttempts
      : 0,
    knowledgeCheckPassed,
    progress: completed ? 100 : Math.min(99, progress),
    completed,
    completedAt: completed ? record.completedAt || record.knowledgeCheckCompletedAt || null : null,
    lessonCount,
    completedLessonCount: completedLessons.length,
    knowledgeCheckQuestionCount: questions.length,
    legacyCompletion: legacyCompletedValue,
    legacyProgress: Number.isFinite(legacyProgressValue) && legacyProgressValue > 0,
    legacyProgressPercent: legacyProgressValue,
    passPercent: KNOWLEDGE_CHECK_PASS_PERCENT,
  };
}

module.exports = { calculateTrainingProgress };