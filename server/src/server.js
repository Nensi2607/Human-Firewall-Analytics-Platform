require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const initializeCollections = require("./utils/initializeCollections");

const PORT = process.env.PORT || 5000;

// Connect Database
// Connect Database and initialize collections
const startServer = async () => {
  await connectDB();
  await initializeCollections();

  // Start Server
  app.listen(PORT, "0.0.0.0", () => {
    logger.success(`Server running on port ${PORT}`);
  });
};

startServer();