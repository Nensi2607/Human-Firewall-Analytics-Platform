require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/database");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const Recommendation = require("../models/Recommendation");
const richTrainings = require("../data/richTrainings");

const legacyTitles = {
  "Password Security and Password Managers": "Password Security",
  "Recognizing Phishing Emails": "Email Security",
  "Social Engineering and Pretexting": "Phishing Awareness",
  "Safe Browsing and Public Wi-Fi": "Safe Internet Browsing",
};

async function seedRichTrainings() {
  await connectDB();
  try {
    let inserted = 0;
    let updated = 0;
    let removedDuplicates = 0;
    let retainedReferencedDuplicates = 0;
    for (const training of richTrainings) {
      const aliasTitle = legacyTitles[training.title];
      const legacy = aliasTitle
        ? await Training.findOne({ title: aliasTitle }).select("_id").lean()
        : null;
      const existing = await Training.findOne({ title: training.title }).select("_id").lean();
      const target = legacy || existing;
      let targetId = target?._id;
      if (target) {
        await Training.updateOne({ _id: target._id }, { $set: training });
        updated += 1;
      } else {
        const result = await Training.updateOne({ title: training.title }, { $set: training }, { upsert: true });
        if (result.upsertedCount) inserted += 1;
        else updated += 1;
        targetId = result.upsertedId;
      }

      const duplicates = await Training.find({ title: training.title, _id: { $ne: targetId } }).select("_id").lean();
      for (const duplicate of duplicates) {
        const [hasProgress, hasRecommendation] = await Promise.all([
          TrainingProgress.exists({ trainingId: duplicate._id }),
          Recommendation.exists({ entityType: "training", entityId: duplicate._id }),
        ]);
        if (hasProgress || hasRecommendation) {
          retainedReferencedDuplicates += 1;
          continue;
        }
        await Training.deleteOne({ _id: duplicate._id });
        removedDuplicates += 1;
      }
    }
    console.log(`Rich training catalog synchronized: ${inserted} inserted, ${updated} updated, ${removedDuplicates} unreferenced duplicates removed.`);
    if (retainedReferencedDuplicates) {
      console.log(`${retainedReferencedDuplicates} duplicate course(s) were retained because progress or recommendations reference them.`);
    }
    console.log("TrainingProgress records are unchanged.");
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedRichTrainings().catch((error) => {
    console.error(`Rich training seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { seedRichTrainings };
