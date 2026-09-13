require("dotenv").config();

const connectDB = require("../config/database");
const Training = require("../models/Training");

const trainings = [
  {
    title: "Password Security",
    description: "Learn how to create and manage secure passwords.",
    category: "Password Security",
    type: "article",
    duration: 10,
  },
  {
    title: "Email Security",
    description: "Learn how to identify and handle suspicious emails safely.",
    category: "Email Security",
    type: "article",
    duration: 10,
  },
  {
    title: "Phishing Awareness",
    description: "Learn how to recognize phishing attempts and protect your account.",
    category: "Phishing Awareness",
    type: "article",
    duration: 10,
  },
  {
    title: "Safe Internet Browsing",
    description: "Learn safer browsing habits for websites, downloads, and updates.",
    category: "Safe Internet Browsing",
    type: "article",
    duration: 10,
  },
];

const seedTrainings = async () => {
  await connectDB();

  for (const training of trainings) {
    await Training.updateOne(
      { title: training.title },
      { $setOnInsert: training },
      { upsert: true }
    );
  }

  console.log(`Seeded ${trainings.length} training records.`);
  process.exit(0);
};

seedTrainings().catch((error) => {
  console.error("Training seed failed:", error.message);
  process.exit(1);
});