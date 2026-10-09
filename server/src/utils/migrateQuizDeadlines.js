require("dotenv").config();

const readline = require("node:readline/promises");
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const { QUIZ_BACKFILL_DAYS } = require("../config/recommendationConfig");

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

async function migrateQuizDeadlines() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const now = new Date();
    const quizzes = await Quiz.find({
      $or: [{ dueDate: { $exists: false } }, { dueDate: null }],
    }).select("title createdAt dueDate").lean();
    const updates = quizzes.map((quiz) => {
      const createdAt = quiz.createdAt && Number.isFinite(new Date(quiz.createdAt).getTime())
        ? new Date(quiz.createdAt)
        : now;
      const createdDeadline = addDays(createdAt, QUIZ_BACKFILL_DAYS);
      return {
        quiz,
        dueDate: createdDeadline > now ? createdDeadline : addDays(now, QUIZ_BACKFILL_DAYS),
      };
    });

    console.log(`Quizzes without a deadline: ${updates.length}`);
    updates.slice(0, 20).forEach(({ quiz, dueDate }) => {
      console.log(`- ${quiz._id} | ${quiz.title} | ${dueDate.toISOString()}`);
    });
    if (updates.length > 20) console.log(`... and ${updates.length - 20} more.`);
    if (!updates.length) return;

    const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
    const confirmation = await terminal.question('Type APPLY to set these deadlines, or anything else to cancel: ');
    terminal.close();
    if (confirmation !== "APPLY") {
      console.log("Cancelled. No quizzes were changed.");
      return;
    }

    const result = await Quiz.bulkWrite(updates.map(({ quiz, dueDate }) => ({
      updateOne: {
        filter: {
          _id: quiz._id,
          $or: [{ dueDate: { $exists: false } }, { dueDate: null }],
        },
        update: { $set: { dueDate } },
      },
    })));
    console.log(`Deadlines set on ${result.modifiedCount} quiz(es). QuizResult records were not touched.`);
  } finally {
    await mongoose.disconnect();
  }
}

migrateQuizDeadlines().catch((error) => {
  console.error(`Quiz deadline migration failed: ${error.message}`);
  process.exitCode = 1;
});