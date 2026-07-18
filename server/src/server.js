require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Start Server
app.listen(PORT, () => {
  logger.success(`Server running on port ${PORT}`);
});