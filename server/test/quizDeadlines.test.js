const test = require("node:test");
const assert = require("node:assert/strict");
const Quiz = require("../src/models/Quiz");
const QuizResult = require("../src/models/QuizResult");
const Question = require("../src/models/Question");
const User = require("../src/models/User");
const Department = require("../src/models/Department");
const { createQuiz } = require("../src/controllers/quizController");
const { submitQuizResult } = require("../src/controllers/quizResultController");

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("new quizzes require a valid future due date", async () => {
  const cases = [
    { title: "No date", targetAll: true },
    { title: "Invalid date", dueDate: "not-a-date", targetAll: true },
    { title: "Past date", dueDate: "2020-01-01T00:00:00.000Z", targetAll: true },
  ];

  for (const body of cases) {
    const response = createResponse();
    await createQuiz({ body, user: { _id: "admin-id" } }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 400);
  }
});

test("quiz creation stores its valid future due date", async () => {
  const original = {
    userCount: User.countDocuments,
    departmentCount: Department.countDocuments,
    quizCreate: Quiz.create,
    userFind: User.find,
  };
  User.countDocuments = async () => 0;
  Department.countDocuments = async () => 0;
  Quiz.create = async (record) => ({ ...record, _id: "new-quiz-id" });
  User.find = () => ({ select() { return this; }, lean: async () => [] });
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const response = createResponse();

  try {
    await createQuiz({
      body: { title: "Future quiz", dueDate, targetAll: true },
      user: { _id: "admin-id" },
    }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 201);
    assert.equal(new Date(response.body.data.dueDate).toISOString(), dueDate);
  } finally {
    User.countDocuments = original.userCount;
    Department.countDocuments = original.departmentCount;
    Quiz.create = original.quizCreate;
    User.find = original.userFind;
  }
});

test("late quiz attempts are accepted and recorded without changing their score", async () => {
  const original = {
    quizFindById: Quiz.findById,
    questionFind: Question.find,
    resultCreate: QuizResult.create,
  };
  const dueDate = new Date("2020-01-01T00:00:00.000Z");
  Quiz.findById = () => ({ lean: async () => ({ _id: "012345678901234567890123", targetAll: true, dueDate }) });
  Question.find = () => ({
    select() { return this; },
    sort() { return this; },
    lean: async () => [{ correctAnswer: "A" }],
  });
  QuizResult.create = async (record) => record;
  const response = createResponse();

  try {
    await submitQuizResult({
      body: { quizId: "012345678901234567890123", answers: ["A"] },
      user: { _id: "employee-id", role: "employee" },
    }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.percentage, 100);
    assert.equal(response.body.data.submittedLate, true);
  } finally {
    Quiz.findById = original.quizFindById;
    Question.find = original.questionFind;
    QuizResult.create = original.resultCreate;
  }
});