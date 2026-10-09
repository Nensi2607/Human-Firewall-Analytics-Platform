const config = require("../config/recommendationConfig");
const { calculateTrainingProgress } = require("./trainingProgressService");

const DAY_MS = 24 * 60 * 60 * 1000;
const idOf = (value) => String(value?._id || value || "");
const percent = (result) => {
  if (Number.isFinite(result.percentage)) return result.percentage;
  if (result.totalQuestions > 0 && Number.isFinite(result.correctAnswers)) {
    return (result.correctAnswers / result.totalQuestions) * 100;
  }
  return null;
};
const nameOf = (user) => `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Employee";
const daysSince = (value, now) => value ? Math.floor((now - new Date(value)) / DAY_MS) : null;
const isTrainingComplete = (record, training) => {
  if (training.lessons?.length && training.knowledgeCheck?.questions?.length) {
    return calculateTrainingProgress(record, training).completed;
  }
  return record?.completed === true;
};
const sortOrder = {
  overdue: 0,
  "due-soon": 1,
  high: 2,
  medium: 3,
  remaining: 4,
  low: 5,
  positive: 6,
};

function buildEmployeeRecommendations({
  employee,
  quizzes,
  quizResults,
  trainings,
  trainingProgress,
  latestPhishingAttempt,
  now = new Date(),
}) {
  const userId = idOf(employee._id);
  const attemptedQuizIds = new Set(quizResults.map((result) => idOf(result.quizId)));
  const progressByTrainingId = new Map(
    trainingProgress.map((record) => [idOf(record.trainingId), record])
  );
  const recommendations = [];

  trainings.forEach((training) => {
    const progress = progressByTrainingId.get(idOf(training._id));
    if (isTrainingComplete(progress, training)) return;
    const completion = Math.min(100, Math.max(0, Number(progress?.progress) || 0));
    recommendations.push({
      recommendationKey: `employee:${userId}:training:${idOf(training._id)}`,
      audience: "employee",
      userId: employee._id,
      recommendationType: "training-remaining",
      entityType: "training",
      entityId: training._id,
      title: `Continue ${training.title}`,
      description: `${completion}% complete. Pick up where you left off, or start this training when you are ready.`,
      reason: progress ? "This assigned training is not marked complete." : "This available training has not been started yet.",
      suggestedAction: "Continue or start this training.",
      actionLabel: "Open training",
      actionUrl: `/training?trainingId=${idOf(training._id)}`,
      priority: "remaining",
    });
  });

  quizzes.forEach((quiz) => {
    if (attemptedQuizIds.has(idOf(quiz._id))) return;
    const dueDate = quiz.dueDate ? new Date(quiz.dueDate) : null;
    let priority = "remaining";
    let dueDescription = "This assigned quiz has not been attempted yet.";
    if (dueDate && dueDate <= now) {
      const daysOverdue = Math.max(1, Math.ceil((now - dueDate) / DAY_MS));
      priority = "overdue";
      dueDescription = `Overdue by ${daysOverdue} ${daysOverdue === 1 ? "day" : "days"}.`;
    } else if (dueDate) {
      const daysLeft = Math.ceil((dueDate - now) / DAY_MS);
      if (daysLeft <= config.QUIZ_DUE_SOON_DAYS) {
        priority = "due-soon";
        dueDescription = `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left until the deadline.`;
      }
    }
    recommendations.push({
      recommendationKey: `employee:${userId}:quiz:${idOf(quiz._id)}`,
      audience: "employee",
      userId: employee._id,
      recommendationType: priority === "overdue" ? "quiz-overdue" : priority === "due-soon" ? "quiz-due-soon" : "quiz-remaining",
      entityType: "quiz",
      entityId: quiz._id,
      dueDate,
      title: priority === "overdue" ? `Overdue: ${quiz.title}` : priority === "due-soon" ? `Due soon: ${quiz.title}` : `Complete ${quiz.title}`,
      description: dueDescription,
      reason: dueDescription,
      suggestedAction: "Open and complete the assigned quiz.",
      actionLabel: "Open quiz",
      actionUrl: `/quiz/${idOf(quiz._id)}`,
      priority,
    });
  });

  if (latestPhishingAttempt?.clicked || latestPhishingAttempt?.linkClicked || latestPhishingAttempt?.credentialsEntered) {
    recommendations.push({
      recommendationKey: `employee:${userId}:phishing:${idOf(latestPhishingAttempt._id)}:review`,
      audience: "employee",
      userId: employee._id,
      recommendationType: "phishing-review",
      entityType: "phishing-attempt",
      entityId: latestPhishingAttempt._id,
      title: "Refresh your phishing-awareness skills",
      description: "Simulations are a safe way to learn. Reviewing the awareness material can help you spot suspicious links next time.",
      reason: "Your latest phishing simulation recorded a link click.",
      suggestedAction: "Review the phishing-awareness training.",
      actionLabel: "Review training",
      actionUrl: "/training",
      priority: "medium",
    });
  } else if (latestPhishingAttempt?.reported) {
    recommendations.push({
      recommendationKey: `employee:${userId}:phishing:${idOf(latestPhishingAttempt._id)}:reported`,
      audience: "employee",
      userId: employee._id,
      recommendationType: "phishing-positive",
      entityType: "phishing-attempt",
      entityId: latestPhishingAttempt._id,
      title: "Good catch reporting that simulation",
      description: "Reporting suspicious messages is exactly the right response. Keep applying that habit to unexpected email.",
      reason: "Your latest phishing simulation was reported.",
      suggestedAction: "Continue practicing safe reporting habits.",
      actionLabel: "View phishing awareness",
      actionUrl: "/phishing",
      priority: "positive",
    });
  }

  return recommendations.sort((left, right) => sortOrder[left.priority] - sortOrder[right.priority]);
}

function buildAdminRecommendations({
  employees,
  departments,
  riskAssessments,
  quizzes,
  quizResults,
  trainings,
  trainingProgress,
  phishingAttempts,
  predictions = new Map(),
  modelAvailable = false,
  now = new Date(),
}) {
  const recommendations = [];
  const departmentById = new Map(departments.map((department) => [idOf(department._id), department]));
  const riskByUser = new Map(riskAssessments.map((assessment) => [idOf(assessment.userId), assessment]));
  const quizById = new Map(quizzes.map((quiz) => [idOf(quiz._id), quiz]));
  const progressByUserTraining = new Map(trainingProgress.map((progress) => [
    `${idOf(progress.userId)}:${idOf(progress.trainingId)}`,
    progress,
  ]));
  const latestAttemptByUser = new Map();
  [...phishingAttempts].sort((left, right) => new Date(right.sentAt || right.createdAt || 0) - new Date(left.sentAt || left.createdAt || 0)).forEach((attempt) => {
    const userId = idOf(attempt.employeeId || attempt.userId);
    if (userId && !latestAttemptByUser.has(userId)) latestAttemptByUser.set(userId, attempt);
  });
  const quizScoresByUserCategory = new Map();
  quizResults.forEach((result) => {
    const userId = idOf(result.userId);
    const quiz = quizById.get(idOf(result.quizId)) || result.quizId;
    const category = quiz?.category || quiz?.title || "Uncategorized";
    const score = percent(result);
    if (!userId || !Number.isFinite(score)) return;
    const key = `${userId}:${category}`;
    quizScoresByUserCategory.set(key, [...(quizScoresByUserCategory.get(key) || []), score]);
  });

  const assessedScores = employees
    .map((employee) => riskByUser.get(idOf(employee._id))?.finalRiskScore)
    .filter(Number.isFinite);
  const organizationAverage = assessedScores.length
    ? assessedScores.reduce((total, score) => total + score, 0) / assessedScores.length
    : null;

  const appendEmployeeRecommendation = (recommendation, userId) => {
    const prediction = modelAvailable ? predictions.get(userId) : null;
    if (prediction) {
      const confidence = Number.isFinite(prediction.confidence)
        ? ` (${Math.round(prediction.confidence * 100)}% confidence)`
        : "";
      recommendation.reason += ` Latest available model prediction: ${prediction.predictedRisk}${confidence}.`;
    }
    recommendations.push(recommendation);
  };

  employees.forEach((employee) => {
    const userId = idOf(employee._id);
    const department = departmentById.get(idOf(employee.departmentId));
    const departmentName = department?.departmentName || "Unassigned";
    const risk = riskByUser.get(userId);
    const riskScore = Number.isFinite(risk?.finalRiskScore) ? risk.finalRiskScore : null;
    const base = { audience: "admin", userId: employee._id, departmentName, riskScoreSnapshot: riskScore };

    if (riskScore === null) {
      appendEmployeeRecommendation({
        ...base,
        recommendationKey: `admin:employee:${userId}:assess`,
        recommendationType: "unassessed-employee",
        entityType: "employee",
        entityId: employee._id,
        title: `Assess ${nameOf(employee)}`,
        description: `${nameOf(employee)} has no Human Risk Score yet and should be assessed before being categorized.`,
        reason: "No risk assessment is recorded; this employee is Unassessed, not Low risk.",
        suggestedAction: "Review the employee record and arrange a risk assessment.",
        actionLabel: "Review employee",
        actionUrl: `/employees/${userId}`,
        priority: "high",
      }, userId);
    } else if (riskScore > config.HIGH_RISK_SCORE) {
      appendEmployeeRecommendation({
        ...base,
        recommendationKey: `admin:employee:${userId}:high-risk`,
        recommendationType: "high-risk-employee",
        entityType: "employee",
        entityId: employee._id,
        title: `Targeted refresher for ${nameOf(employee)}`,
        description: `${nameOf(employee)} in ${departmentName} has a High Human Risk Score (${riskScore}/100).`,
        reason: `The recorded risk score is ${riskScore}/100, above the current High category boundary (${config.HIGH_RISK_SCORE}/100).`,
        suggestedAction: "Assign a targeted quiz or refresher training and review progress.",
        actionLabel: "Assign targeted quiz",
        actionUrl: `/admin/quizzes?employeeId=${userId}`,
        priority: "high",
      }, userId);
    }

    const latestAttempt = latestAttemptByUser.get(userId);
    if (!latestAttempt) {
      appendEmployeeRecommendation({
        ...base,
        recommendationKey: `admin:employee:${userId}:phishing:none`,
        recommendationType: "no-phishing-simulation",
        entityType: "employee",
        entityId: employee._id,
        title: `Include ${nameOf(employee)} in the next simulation`,
        description: `No phishing simulation is recorded for ${nameOf(employee)}.`,
        reason: "There is no simulation result to evaluate susceptibility.",
        suggestedAction: "Include this employee in the next phishing campaign.",
        actionLabel: "Create targeted campaign",
        actionUrl: `/admin/phishing?employeeId=${userId}`,
        priority: "medium",
      }, userId);
    } else if (latestAttempt.clicked || latestAttempt.linkClicked || latestAttempt.credentialsEntered) {
      appendEmployeeRecommendation({
        ...base,
        recommendationKey: `admin:employee:${userId}:phishing:${idOf(latestAttempt._id)}`,
        recommendationType: "phishing-susceptibility",
        entityType: "employee",
        entityId: employee._id,
        title: `Follow up with ${nameOf(employee)} on phishing identification`,
        description: `${nameOf(employee)} clicked a link in the latest recorded phishing simulation.`,
        reason: "The latest simulation recorded a click, indicating an opportunity for a supportive follow-up test.",
        suggestedAction: "Run a targeted phishing-identification follow-up.",
        actionLabel: "Create follow-up campaign",
        actionUrl: `/admin/phishing?employeeId=${userId}`,
        priority: "high",
      }, userId);
    }

    for (const [key, scores] of quizScoresByUserCategory.entries()) {
      if (!key.startsWith(`${userId}:`)) continue;
      const category = key.slice(userId.length + 1);
      const averageScore = scores.reduce((total, score) => total + score, 0) / scores.length;
      if (averageScore >= config.LOW_QUIZ_SCORE) continue;
      appendEmployeeRecommendation({
        ...base,
        recommendationKey: `admin:employee:${userId}:quiz:${encodeURIComponent(category)}`,
        recommendationType: "low-quiz-performance",
        entityType: "employee",
        entityId: employee._id,
        title: `Remedial quiz for ${nameOf(employee)}: ${category}`,
        description: `${nameOf(employee)} averages ${Math.round(averageScore)}% in ${category}.`,
        reason: `Average score in ${category} is below the ${config.LOW_QUIZ_SCORE}% review cutoff.`,
        suggestedAction: `Assign a remedial quiz focused on ${category}.`,
        actionLabel: "Assign remedial quiz",
        actionUrl: `/admin/quizzes?employeeId=${userId}&category=${encodeURIComponent(category)}`,
        priority: "medium",
      }, userId);
    }

    trainings.forEach((training) => {
      const progress = progressByUserTraining.get(`${userId}:${idOf(training._id)}`);
      if (isTrainingComplete(progress, training)) return;
      const lastActivity = progress?.updatedAt || progress?.createdAt || training.createdAt;
      const idleDays = daysSince(lastActivity, now);
      if (idleDays === null || idleDays < config.TRAINING_INACTIVITY_DAYS) return;
      appendEmployeeRecommendation({
        ...base,
        recommendationKey: `admin:employee:${userId}:training:${idOf(training._id)}`,
        recommendationType: "training-non-completion",
        entityType: "employee",
        entityId: employee._id,
        title: `Follow up on ${training.title} for ${nameOf(employee)}`,
        description: `${nameOf(employee)} has not completed ${training.title}; there has been no completion or progress activity for ${idleDays} days.`,
        reason: `Training has remained incomplete for ${idleDays} days (the module publication date is used when no employee progress record exists).`,
        suggestedAction: "Send a reminder or review whether escalation is needed.",
        actionLabel: "Open training manager",
        actionUrl: "/admin/training",
        priority: "medium",
      }, userId);
    });
  });

  if (organizationAverage !== null) {
    const departmentGroups = new Map();
    employees.forEach((employee) => {
      const departmentId = idOf(employee.departmentId);
      if (!departmentId || !departmentById.has(departmentId)) return;
      departmentGroups.set(departmentId, [...(departmentGroups.get(departmentId) || []), employee]);
    });
    departmentGroups.forEach((group, departmentId) => {
      const assessed = group
        .map((employee) => riskByUser.get(idOf(employee._id))?.finalRiskScore)
        .filter(Number.isFinite);
      if (assessed.length < config.DEPARTMENT_MIN_ASSESSED_EMPLOYEES) return;
      const averageScore = assessed.reduce((total, score) => total + score, 0) / assessed.length;
      if (averageScore < organizationAverage + config.DEPARTMENT_RISK_MARGIN) return;
      const department = departmentById.get(departmentId);
      recommendations.push({
        recommendationKey: `admin:department:${departmentId}:risk-gap`,
        audience: "admin",
        departmentId: department._id,
        departmentName: department.departmentName,
        recommendationType: "department-risk-gap",
        entityType: "department",
        entityId: department._id,
        title: `Organization-wide follow-up for ${department.departmentName}`,
        description: `${department.departmentName} averages ${averageScore.toFixed(1)}/100 risk versus ${organizationAverage.toFixed(1)}/100 across assessed employees.`,
        reason: `The department average is at least ${config.DEPARTMENT_RISK_MARGIN} points above the organization average, based on ${assessed.length} assessed employees.`,
        suggestedAction: "Plan a department-wide refresher or phishing-awareness campaign.",
        actionLabel: "Create department campaign",
        actionUrl: `/admin/phishing?departmentId=${departmentId}`,
        priority: "high",
      });
    });
  }

  return recommendations;
}

module.exports = { buildEmployeeRecommendations, buildAdminRecommendations };