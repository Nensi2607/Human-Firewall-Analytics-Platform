const test = require("node:test");
const assert = require("node:assert/strict");
const Training = require("../src/models/Training");
const TrainingProgress = require("../src/models/TrainingProgress");
const { submitKnowledgeCheck } = require("../src/controllers/trainingProgressController");

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("knowledge checks are graded by the server and only a passing check completes finished lessons", async () => {
  const original = {
    trainingFindById: Training.findById,
    progressFindOne: TrainingProgress.findOne,
    progressCreate: TrainingProgress.create,
    progressUpdate: TrainingProgress.findByIdAndUpdate,
  };
  const trainingId = "507f1f77bcf86cd799439011";
  const employeeId = "507f1f77bcf86cd799439012";
  const training = {
    _id: trainingId,
    lessons: [{ title: "Lesson one" }],
    knowledgeCheck: {
      questions: [
        { question: "Q1", options: ["A", "B"], correctAnswer: 1 },
        { question: "Q2", options: ["A", "B"], correctAnswer: 0 },
        { question: "Q3", options: ["A", "B"], correctAnswer: 1 },
        { question: "Q4", options: ["A", "B"], correctAnswer: 0 },
      ],
    },
  };
  let stored = {
    _id: "507f1f77bcf86cd799439013",
    userId: employeeId,
    trainingId,
    openedLessons: [0],
    completedLessons: [0],
    knowledgeCheckAttempts: 0,
    knowledgeCheckPassed: false,
  };
  let capturedOwner;
  Training.findById = () => ({ select() { return this; }, lean: async () => training });
  TrainingProgress.findOne = (filter) => {
    capturedOwner = filter.userId;
    return { select() { return this; }, lean: async () => stored };
  };
  TrainingProgress.findByIdAndUpdate = (_id, update) => {
    stored = { ...stored, ...update.$set };
    return { select() { return this; }, lean: async () => stored };
  };

  try {
    const response = createResponse();
    await submitKnowledgeCheck({
      params: { trainingId },
      user: { _id: employeeId, role: "employee" },
      body: { answers: [1, 0, 1, 0], score: 0, completed: false },
    }, response, (error) => { throw error; });

    assert.equal(response.statusCode, 200);
    assert.equal(capturedOwner, employeeId);
    assert.equal(response.body.data.attemptScore, 100);
    assert.equal(response.body.data.knowledgeCheckPassed, true);
    assert.equal(response.body.data.progress, 100);
    assert.equal(response.body.data.completed, true);
  } finally {
    Training.findById = original.trainingFindById;
    TrainingProgress.findOne = original.progressFindOne;
    TrainingProgress.create = original.progressCreate;
    TrainingProgress.findByIdAndUpdate = original.progressUpdate;
  }
});

test("employees cannot submit a knowledge check before every lesson is finished", async () => {
  const original = {
    trainingFindById: Training.findById,
    progressFindOne: TrainingProgress.findOne,
    progressCreate: TrainingProgress.create,
    progressUpdate: TrainingProgress.findByIdAndUpdate,
  };
  Training.findById = () => ({
    select() { return this; },
    lean: async () => ({
      _id: "507f1f77bcf86cd799439021",
      lessons: [{ title: "Lesson one" }],
      knowledgeCheck: { questions: [{ question: "Question", options: ["A", "B"], correctAnswer: 0 }] },
    }),
  });
  TrainingProgress.findOne = () => ({ select() { return this; }, lean: async () => null });
  TrainingProgress.create = async () => ({
    _id: "507f1f77bcf86cd799439022",
    openedLessons: [],
    completedLessons: [],
  });
  let updateCalled = false;
  TrainingProgress.findByIdAndUpdate = () => { updateCalled = true; throw new Error("unexpected write"); };

  try {
    const response = createResponse();
    await submitKnowledgeCheck({
      params: { trainingId: "507f1f77bcf86cd799439021" },
      user: { _id: "507f1f77bcf86cd799439023", role: "employee" },
      body: { answers: [0] },
    }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 400);
    assert.equal(updateCalled, false);
  } finally {
    Training.findById = original.trainingFindById;
    TrainingProgress.findOne = original.progressFindOne;
    TrainingProgress.create = original.progressCreate;
    TrainingProgress.findByIdAndUpdate = original.progressUpdate;
  }
});