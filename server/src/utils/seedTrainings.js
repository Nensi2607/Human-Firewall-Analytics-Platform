require("dotenv").config();

const { seedRichTrainings } = require("./seedRichTrainings");

seedRichTrainings().catch((error) => {
  console.error(`Training seed failed: ${error.message}`);
  process.exitCode = 1;
});