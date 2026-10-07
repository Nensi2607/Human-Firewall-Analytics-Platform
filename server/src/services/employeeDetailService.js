const buildEmployeeDetail = ({
  employee,
  quizResults,
  trainingProgress,
  trainings,
  quizzes,
  phishingAttempts,
  phishingAwareness,
  riskAssessment,
  prediction,
}) => {
  const trainingTotal = trainings.length;
  const completedTrainingCount = trainingProgress.filter(
    (record) => record?.completed === true
  ).length;
  const trainingAverage =
    trainingTotal > 0
      ? Math.round(
          ((trainingProgress.reduce((total, record) => {
            if (record?.completed) return total + 100;
            if (typeof record?.progress === "number" && Number.isFinite(record.progress)) {
              return total + Math.min(100, Math.max(0, record.progress));
            }
            return total;
          }, 0)) /
            trainingTotal) *
            10
        ) / 10
      : null;

  const quizAverage =
    quizResults.length > 0
      ? Math.round(
          (quizResults.reduce((total, result) => total + (result?.percentage ?? 0), 0) /
            quizResults.length) * 10
        ) / 10
      : null;
  const completedQuizCount = new Set(
    quizResults.map((result) => result?.quizId?.toString?.() || result?.quizId)
  ).size;

  const phishingSummary = {
    sent: phishingAttempts.length,
    clicked: phishingAttempts.filter((attempt) => attempt?.clicked === true).length,
    reported: phishingAttempts.filter((attempt) => attempt?.reported === true).length,
    opened: phishingAttempts.filter((attempt) => attempt?.emailOpened === true).length,
  };

  const latestQuizResult = [...quizResults].sort((first, second) => {
    const firstDate = new Date(first?.completedAt || first?.submittedAt || 0).getTime();
    const secondDate = new Date(second?.completedAt || second?.submittedAt || 0).getTime();
    return secondDate - firstDate;
  })[0] || null;

  return {
    employee: {
      _id: employee?._id,
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      email: employee?.email || "",
      departmentId: employee?.departmentId || null,
      designation: employee?.designation || "",
      status: employee?.status || "active",
      role: employee?.role || "employee",
      createdAt: employee?.createdAt || null,
    },
    training: {
      completed: completedTrainingCount,
      total: trainingTotal,
      completionPercentage: trainingAverage,
    },
    quiz: {
      completed: completedQuizCount,
      total: quizzes.length,
      avgScore: quizAverage,
      latest: latestQuizResult
        ? {
            quizId: latestQuizResult.quizId || null,
            title: latestQuizResult.quizId?.title || null,
            percentage: latestQuizResult.percentage ?? null,
            correctAnswers: latestQuizResult.correctAnswers ?? null,
            totalQuestions: latestQuizResult.totalQuestions ?? null,
            completedAt: latestQuizResult.completedAt || latestQuizResult.submittedAt || null,
          }
        : null,
    },
    phishing: {
      summary: phishingSummary,
      attempts: phishingAttempts.map((attempt) => ({
        _id: attempt?._id,
        campaignId: attempt?.campaignId || null,
        title: attempt?.campaignId?.title || null,
        sentAt: attempt?.sentAt || null,
        clicked: Boolean(attempt?.clicked),
        clickedAt: attempt?.clickedAt || null,
        emailOpened: Boolean(attempt?.emailOpened),
        emailOpenedAt: attempt?.emailOpenedAt || null,
        reported: Boolean(attempt?.reported),
        reportedAt: attempt?.reportedAt || null,
        credentialsEntered: Boolean(attempt?.credentialsEntered),
      })),
    },
    phishingAwareness: phishingAwareness
      ? {
          totalScenarios: phishingAwareness.totalScenarios ?? null,
          correctAnswers: phishingAwareness.correctAnswers ?? null,
          score: phishingAwareness.score ?? null,
          completedAt: phishingAwareness.completedAt || null,
        }
      : null,
    risk: riskAssessment
      ? {
          finalRiskScore: riskAssessment.finalRiskScore ?? null,
          riskLevel: riskAssessment.riskLevel ?? null,
          trainingScore: riskAssessment.trainingScore ?? null,
          quizScore: riskAssessment.quizScore ?? null,
          phishingScore: riskAssessment.phishingScore ?? null,
          securityAwarenessScore: riskAssessment.securityAwarenessScore ?? null,
          assessedAt: riskAssessment.assessedAt || null,
        }
      : null,
    aiPrediction: prediction
      ? {
          predictedRisk: prediction.predictedRisk || null,
          confidence: prediction.confidence ?? null,
          modelVersion: prediction.modelVersion || null,
          generatedAt: prediction.generatedAt || null,
        }
      : null,
  };
};

module.exports = { buildEmployeeDetail };
