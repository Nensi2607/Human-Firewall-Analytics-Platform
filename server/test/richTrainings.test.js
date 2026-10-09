const test = require("node:test");
const assert = require("node:assert/strict");
const richTrainings = require("../src/data/richTrainings");
const Training = require("../src/models/Training");

test("rich training seed contains at least eight complete courses with original lessons and checks", () => {
  assert.ok(richTrainings.length >= 8);
  const titles = richTrainings.map((training) => training.title);
  assert.equal(new Set(titles).size, titles.length);

  richTrainings.forEach((training) => {
    assert.ok(training.lessons.length >= 3 && training.lessons.length <= 5, training.title);
    assert.ok(training.knowledgeCheck.questions.length >= 4 && training.knowledgeCheck.questions.length <= 5, training.title);
    training.lessons.forEach((lesson) => {
      assert.ok(lesson.body.length >= 2, `${training.title}: ${lesson.title}`);
      assert.ok(lesson.body.every((paragraph) => paragraph.trim().length > 100), `${training.title}: ${lesson.title}`);
      assert.ok(lesson.keyTakeaways.length >= 3 && lesson.keyTakeaways.length <= 5, `${training.title}: ${lesson.title}`);
    });
    training.knowledgeCheck.questions.forEach((question) => {
      assert.equal(typeof question.correctAnswer, "number");
      assert.ok(question.correctAnswer >= 0 && question.correctAnswer < question.options.length);
    });
  });
});

test("knowledge-check answer paths are excluded by default from Training model queries", () => {
  assert.equal(Training.schema.path("knowledgeCheck.questions.correctAnswer").options.select, false);
});