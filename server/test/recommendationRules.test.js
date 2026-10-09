const test = require("node:test");
const assert = require("node:assert/strict");
const config = require("../src/config/recommendationConfig");
const {
  buildEmployeeRecommendations,
  buildAdminRecommendations,
} = require("../src/services/recommendationRules");

const now = new Date("2026-10-09T12:00:00.000Z");
const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

test("employee recommendations prioritize overdue and due-soon quizzes and show only their own assigned work", () => {
  const recommendations = buildEmployeeRecommendations({
    employee: { _id: "employee-1", departmentId: "department-1" },
    quizzes: [
      { _id: "quiz-overdue", title: "Overdue Quiz", dueDate: daysFromNow(-1) },
      { _id: "quiz-soon", title: "Soon Quiz", dueDate: daysFromNow(2) },
      { _id: "quiz-later", title: "Later Quiz", dueDate: daysFromNow(10) },
      { _id: "quiz-done", title: "Completed Quiz", dueDate: daysFromNow(1) },
    ],
    quizResults: [{ quizId: "quiz-done", percentage: 90 }],
    trainings: [{ _id: "training-1", title: "Phishing Basics" }],
    trainingProgress: [{ trainingId: "training-1", progress: 40, completed: false }],
    latestPhishingAttempt: { _id: "attempt-1", clicked: true },
    now,
  });

  assert.equal(recommendations[0].priority, "overdue");
  assert.equal(recommendations[0].recommendationType, "quiz-overdue");
  assert.equal(recommendations[1].priority, "due-soon");
  assert.ok(recommendations.every((item) => item.userId === "employee-1"));
  assert.ok(recommendations.some((item) => item.title === "Continue Phishing Basics" && item.description.startsWith("40%")));
  assert.ok(recommendations.some((item) => item.recommendationType === "phishing-review"));
  assert.ok(!recommendations.some((item) => item.entityId === "quiz-done"));
  assert.ok(recommendations.some((item) => item.entityId === "quiz-later" && item.priority === "remaining"));
});

test("employee reported phishing feedback is positive and unattempted quizzes without deadlines do not invent one", () => {
  const recommendations = buildEmployeeRecommendations({
    employee: { _id: "employee-2" },
    quizzes: [{ _id: "quiz-no-deadline", title: "No Deadline", dueDate: null }],
    quizResults: [],
    trainings: [],
    trainingProgress: [],
    latestPhishingAttempt: { _id: "attempt-2", reported: true },
    now,
  });

  assert.equal(recommendations.find((item) => item.entityId === "quiz-no-deadline").priority, "remaining");
  assert.equal(recommendations.find((item) => item.recommendationType === "phishing-positive").priority, "positive");
  assert.equal(recommendations.find((item) => item.entityId === "quiz-no-deadline").dueDate, null);
});

test("legacy training completion does not mark newly enriched lesson courses complete", () => {
  const recommendations = buildEmployeeRecommendations({
    employee: { _id: "employee-legacy" },
    quizzes: [],
    quizResults: [],
    trainings: [{
      _id: "training-legacy",
      title: "Refreshed Security Course",
      lessons: [{ title: "Lesson" }],
      knowledgeCheck: { questions: [{ question: "Check" }] },
    }],
    trainingProgress: [{ userId: "employee-legacy", trainingId: "training-legacy", completed: true, progress: 100 }],
    latestPhishingAttempt: null,
    now,
  });

  assert.ok(recommendations.some((item) => item.entityId === "training-legacy" && item.recommendationType === "training-remaining"));
});

test("admin recommendations distinguish unassessed employees and use configured risk, quiz, training, and department thresholds", () => {
  const employees = [
    { _id: "e1", firstName: "Ada", lastName: "One", departmentId: "d1" },
    { _id: "e2", firstName: "Ben", lastName: "Two", departmentId: "d1" },
    { _id: "e3", firstName: "Cy", lastName: "Three", departmentId: "d1" },
    { _id: "e4", firstName: "Dee", lastName: "Four", departmentId: "d2" },
    { _id: "e5", firstName: "Eve", lastName: "Five", departmentId: "d2" },
  ];
  const riskAssessments = [
    { userId: "e1", finalRiskScore: 80, riskLevel: "High" },
    { userId: "e2", finalRiskScore: 80, riskLevel: "High" },
    { userId: "e3", finalRiskScore: 80, riskLevel: "High" },
    { userId: "e4", finalRiskScore: 30, riskLevel: "Low" },
  ];
  const recommendations = buildAdminRecommendations({
    employees,
    departments: [
      { _id: "d1", departmentName: "Engineering" },
      { _id: "d2", departmentName: "Operations" },
    ],
    riskAssessments,
    quizzes: [{ _id: "q1", title: "Email Safety", category: "Email Safety" }],
    quizResults: [{ userId: "e1", quizId: { _id: "q1", title: "Email Safety", category: "Email Safety" }, percentage: 60 }],
    trainings: [{ _id: "t1", title: "Security Refresher", createdAt: daysFromNow(-20) }],
    trainingProgress: [],
    phishingAttempts: [{ _id: "p1", employeeId: "e1", clicked: true, sentAt: daysFromNow(-2) }],
    predictions: new Map([[
      "e1",
      { predictedRisk: "Medium", confidence: 0.8, modelVersion: "test-model" },
    ]]),
    modelAvailable: true,
    now,
  });

  const unassessed = recommendations.find((item) => item.userId === "e5");
  assert.equal(unassessed.recommendationType, "unassessed-employee");
  assert.match(unassessed.reason, /Unassessed, not Low risk/);
  assert.ok(recommendations.some((item) => item.userId === "e1" && item.recommendationType === "high-risk-employee"));
  assert.ok(recommendations.some((item) => item.userId === "e1" && item.recommendationType === "low-quiz-performance"));
  assert.ok(recommendations.some((item) => item.userId === "e1" && item.recommendationType === "training-non-completion"));
  assert.ok(recommendations.some((item) => item.userId === "e1" && item.recommendationType === "phishing-susceptibility"));
  assert.ok(recommendations.some((item) => item.recommendationType === "no-phishing-simulation" && item.userId === "e5"));
  assert.ok(recommendations.some((item) => item.recommendationType === "department-risk-gap" && item.departmentId === "d1"));
  assert.ok(recommendations.find((item) => item.recommendationType === "high-risk-employee").reason.includes("Medium (80% confidence)"));
  assert.equal(config.HIGH_RISK_SCORE, 60);
  assert.equal(config.LOW_QUIZ_SCORE, 70);
});