const mongoose = require("mongoose");

const models = [
  require("../models/User"),
  require("../models/Department"),
  require("../models/Quiz"),
  require("../models/Question"),
  require("../models/QuizResult"),
  require("../models/Training"),
  require("../models/TrainingProgress"),
  require("../models/PhishingCampaign"),
  require("../models/PhishingAttempt"),
  require("../models/RiskAssessment"),
  require("../models/AIPrediction"),
  require("../models/Recommendation"),
  require("../models/Notification"),
  require("../models/Report"),
];

const initializeCollections = async () => {
  const existingCollections = await mongoose.connection.db
    .listCollections()
    .toArray();

  const existingNames = new Set(
    existingCollections.map((collection) => collection.name)
  );

  for (const model of models) {
    if (!existingNames.has(model.collection.name)) {
      await model.createCollection();
      console.log(`✅ Created collection: ${model.collection.name}`);
    }
  }

  console.log("✅ Database collections initialized");
};

module.exports = initializeCollections;