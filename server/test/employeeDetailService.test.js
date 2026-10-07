const test = require("node:test");
const assert = require("node:assert/strict");

const { buildEmployeeDetail } = require("../src/services/employeeDetailService");

test("buildEmployeeDetail combines profile, activity, risk, phishing, and prediction data", () => {
  const employee = {
    _id: "employee-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    departmentId: { _id: "dept-1", departmentName: "Engineering" },
    designation: "Analyst",
    status: "active",
    createdAt: "2025-01-01T00:00:00.000Z",
    role: "employee",
  };
  const detail = buildEmployeeDetail({
    employee,
    quizResults: [
      { quizId: "quiz-1", percentage: 80, correctAnswers: 8, totalQuestions: 10, submittedAt: "2025-01-02T00:00:00.000Z" },
      { quizId: "quiz-2", percentage: 60, correctAnswers: 6, totalQuestions: 10, submittedAt: "2025-01-03T00:00:00.000Z" },
    ],
    trainingProgress: [
      { trainingId: { _id: "training-1", title: "Security Basics" }, completed: true, completedAt: "2025-01-04T00:00:00.000Z" },
      { trainingId: { _id: "training-2", title: "Phishing Defense" }, completed: false, progress: 75 },
    ],
    trainings: [
      { _id: "training-1", title: "Security Basics" },
      { _id: "training-2", title: "Phishing Defense" },
    ],
    quizzes: [
      { _id: "quiz-1", title: "Security Foundations" },
      { _id: "quiz-2", title: "Threat Recognition" },
    ],
    phishingAttempts: [
      { campaignId: { _id: "campaign-1", title: "Quarterly Trick" }, sentAt: "2025-01-05T00:00:00.000Z", clicked: true, clickedAt: "2025-01-05T12:00:00.000Z", reported: false, emailOpened: true, emailOpenedAt: "2025-01-05T10:00:00.000Z" },
      { campaignId: { _id: "campaign-2", title: "Password Test" }, sentAt: "2025-01-06T00:00:00.000Z", clicked: false, reported: true, reportedAt: "2025-01-06T13:00:00.000Z" },
    ],
    phishingAwareness: { totalScenarios: 20, correctAnswers: 16, score: 80, completedAt: "2025-01-07T00:00:00.000Z" },
    riskAssessment: { finalRiskScore: 72, riskLevel: "High", assessedAt: "2025-01-08T00:00:00.000Z" },
    prediction: { predictedRisk: "High", confidence: 0.87, modelVersion: "risk-v1", generatedAt: "2025-01-09T00:00:00.000Z" },
  });

  assert.equal(detail.employee._id, "employee-1");
  assert.equal(detail.training.completed, 1);
  assert.equal(detail.training.total, 2);
  assert.equal(detail.training.completionPercentage, 87.5);
  assert.equal(detail.quiz.completed, 2);
  assert.equal(detail.quiz.total, 2);
  assert.equal(detail.quiz.avgScore, 70);
  assert.equal(detail.phishing.summary.sent, 2);
  assert.equal(detail.phishing.summary.clicked, 1);
  assert.equal(detail.phishing.summary.reported, 1);
  assert.equal(detail.risk.finalRiskScore, 72);
  assert.equal(detail.risk.riskLevel, "High");
  assert.equal(detail.aiPrediction.predictedRisk, "High");
  assert.equal(detail.aiPrediction.confidence, 0.87);
  assert.equal(detail.phishingAwareness.score, 80);
});

test("buildEmployeeDetail handles missing records without breaking the page", () => {
  const detail = buildEmployeeDetail({
    employee: { _id: "employee-2", firstName: "Grace", lastName: "Hopper", email: "grace@example.com", designation: "Engineer", status: "active", role: "employee" },
    quizResults: [],
    trainingProgress: [],
    trainings: [],
    quizzes: [],
    phishingAttempts: [],
    phishingAwareness: null,
    riskAssessment: null,
    prediction: null,
  });

  assert.equal(detail.training.completed, 0);
  assert.equal(detail.training.total, 0);
  assert.equal(detail.training.completionPercentage, null);
  assert.equal(detail.quiz.completed, 0);
  assert.equal(detail.quiz.total, 0);
  assert.equal(detail.quiz.avgScore, null);
  assert.equal(detail.phishing.summary.sent, 0);
  assert.equal(detail.risk, null);
  assert.equal(detail.aiPrediction, null);
  assert.equal(detail.phishingAwareness, null);
});
