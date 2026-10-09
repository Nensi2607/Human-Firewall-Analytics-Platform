const test = require("node:test");
const assert = require("node:assert/strict");
const { KNOWLEDGE_CHECK_PASS_PERCENT } = require("../src/config/trainingConfig");
const { calculateTrainingProgress } = require("../src/services/trainingProgressService");

const course = {
  lessons: [{}, {}, {}],
  knowledgeCheck: { questions: [{}, {}, {}, {}] },
};

test("progress is calculated from finished lessons and the passed knowledge check", () => {
  const beforeCheck = calculateTrainingProgress({ completedLessons: [0, 1, 2] }, course);
  assert.equal(beforeCheck.progress, 75);
  assert.equal(beforeCheck.completed, false);

  const passed = calculateTrainingProgress({ completedLessons: [0, 1, 2], knowledgeCheckPassed: true }, course);
  assert.equal(passed.progress, 100);
  assert.equal(passed.completed, true);
});

test("browser-supplied legacy percentages cannot manufacture completion and prior progress is preserved", () => {
  const legacy = calculateTrainingProgress({ progress: 100, completed: true }, course);
  assert.equal(legacy.progress, 0);
  assert.equal(legacy.completed, false);
  assert.equal(legacy.legacyCompletion, true);
  assert.equal(legacy.legacyProgressPercent, 100);
});

test("archived legacy completion remains visible after current course activity begins", () => {
  const updated = calculateTrainingProgress({
    progress: 25,
    completed: false,
    openedLessons: [0],
    completedLessons: [0],
    legacyProgressValue: 100,
    legacyCompletedValue: true,
    legacyCompletedAt: new Date("2025-05-01T00:00:00Z"),
    legacyCapturedAt: new Date("2026-10-09T00:00:00Z"),
  }, course);
  assert.equal(updated.progress, 25);
  assert.equal(updated.completed, false);
  assert.equal(updated.legacyCompletion, true);
  assert.equal(updated.legacyProgressPercent, 100);
});

test("the check pass mark is centralized in the server training configuration", () => {
  assert.equal(KNOWLEDGE_CHECK_PASS_PERCENT, 75);
});